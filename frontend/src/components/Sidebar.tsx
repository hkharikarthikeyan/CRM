import { NavLink } from "@/components/NavLink";
import { Clock, FileText, Calendar, Users, LogOut, BarChart3, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLeave } from "@/contexts/LeaveContext";

interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: number;
}

const employeeNavigation: NavigationItem[] = [
  { title: "Dashboard", url: "/", icon: Clock },
  { title: "My Attendance", url: "/attendance", icon: FileText },
  { title: "My Leaves", url: "/leaves", icon: Calendar },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Sidebar = ({ open, onOpenChange }: SidebarProps) => {
  const { user, isAdmin, logout } = useAuth();
  const { leaveRequests } = useLeave();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Calculate pending leave requests for admin badge
  const pendingLeaveCount = leaveRequests.filter((l) => l.status === "pending").length;

  const adminNavigation: NavigationItem[] = [
    { title: "Dashboard", url: "/admin", icon: BarChart3 },
    { title: "Employees", url: "/admin/employees", icon: Users },
    { title: "Attendance", url: "/admin/attendance", icon: Clock },
    { title: "Leave Requests", url: "/admin/leaves", icon: Calendar, badge: pendingLeaveCount || undefined },
    { title: "Attendance Corrections", url: "/admin/corrections", icon: FileText, badge: 2 },
    { title: "Reports", url: "/admin/reports", icon: BarChart3 },
    { title: "Admin Panel", url: "/admin/panel", icon: Settings },
  ];
  
  const navigationItems = isAdmin ? adminNavigation : employeeNavigation;
  
  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (isMobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  const SidebarContent = () => (
    <aside className="w-72 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-sidebar-foreground">
            {isAdmin ? "Admin Portal" : "Employee Portal"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Manage Attendance" : "Attendance & Leave"}
          </p>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => onOpenChange?.(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/" || item.url === "/admin"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-all relative"
            activeClassName="bg-nav-active text-nav-active-foreground font-medium"
            onClick={handleNavClick}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1 truncate">{item.title}</span>
            {'badge' in item && item.badge && (
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border space-y-3">

        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.role}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-destructive border-destructive/20 hover:bg-destructive/5"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );

  // Mobile: use Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: render directly
  return <SidebarContent />;
};
