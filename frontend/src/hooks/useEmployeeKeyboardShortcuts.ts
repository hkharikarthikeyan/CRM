import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { toast } from "@/hooks/use-toast";

interface UseEmployeeKeyboardShortcutsProps {
  onOpenHelp: () => void;
}

export const useEmployeeKeyboardShortcuts = ({ onOpenHelp }: UseEmployeeKeyboardShortcutsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { addClockIn, addClockOut, getTodayRecord } = useAttendance();

  const isTyping = useCallback(() => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    const tagName = activeElement.tagName.toLowerCase();
    const isEditable = activeElement.getAttribute("contenteditable") === "true";
    
    return tagName === "input" || tagName === "textarea" || isEditable;
  }, []);

  const isMobile = useCallback(() => {
    return window.innerWidth < 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  const isEmployeeArea = useCallback(() => {
    // Only work in employee area (not admin, not login)
    return isAuthenticated && !isAdmin && !location.pathname.startsWith("/admin") && location.pathname !== "/login";
  }, [isAuthenticated, isAdmin, location.pathname]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if not employee area, typing, or on mobile
    if (!isEmployeeArea() || isTyping() || isMobile()) return;

    // Skip if any modifier keys are pressed (to not override browser shortcuts)
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const key = event.key.toLowerCase();

    switch (key) {
      case "d":
        event.preventDefault();
        navigate("/");
        toast({
          title: "Navigated to Dashboard",
          description: "Shortcut: D",
        });
        break;

      case "a":
        event.preventDefault();
        navigate("/attendance");
        toast({
          title: "Navigated to My Attendance",
          description: "Shortcut: A",
        });
        break;

      case "l":
        event.preventDefault();
        navigate("/leaves");
        toast({
          title: "Navigated to Apply Leave",
          description: "Shortcut: L",
        });
        break;

      case "p":
        event.preventDefault();
        navigate("/reports");
        toast({
          title: "Navigated to Profile/Reports",
          description: "Shortcut: P",
        });
        break;

      case "t":
        // Theme toggle removed - dark mode only
        break;

      case "h":
        event.preventDefault();
        onOpenHelp();
        break;

      case "i":
        // Clock In - only on dashboard
        if (location.pathname === "/" && user) {
          event.preventDefault();
          const todayRecord = getTodayRecord(user.employeeId);
          
          if (!todayRecord) {
            const record = addClockIn(user.employeeId);
            toast({
              title: "Clocked In Successfully",
              description: `You clocked in at ${record.clockIn} (Shortcut: I)`,
            });
          } else if (!todayRecord.clockOut) {
            toast({
              title: "Already Clocked In",
              description: "Use O to clock out",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Already Completed",
              description: "You've already completed attendance for today",
              variant: "destructive",
            });
          }
        }
        break;

      case "o":
        // Clock Out - only on dashboard
        if (location.pathname === "/" && user) {
          event.preventDefault();
          const todayRecord = getTodayRecord(user.employeeId);
          
          if (todayRecord && !todayRecord.clockOut) {
            addClockOut(user.employeeId);
            toast({
              title: "Clocked Out Successfully",
              description: `You clocked out (Shortcut: O)`,
            });
          } else if (!todayRecord) {
            toast({
              title: "Not Clocked In",
              description: "Use I to clock in first",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Already Clocked Out",
              description: "You've already clocked out for today",
              variant: "destructive",
            });
          }
        }
        break;
    }
  }, [
    isEmployeeArea,
    isTyping,
    isMobile,
    navigate,
    onOpenHelp,
    location.pathname,
    user,
    getTodayRecord,
    addClockIn,
    addClockOut,
  ]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
