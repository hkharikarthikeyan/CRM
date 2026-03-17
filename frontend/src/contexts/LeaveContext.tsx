import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LeaveRequest } from "@/lib/mockData";
import { apiService } from "@/lib/supabase";

const ANNUAL_LEAVE_QUOTA = 20;

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (request: Omit<LeaveRequest, "id" | "status" | "appliedOn">) => void;
  approveLeaveRequest: (requestId: string) => void;
  rejectLeaveRequest: (requestId: string) => void;
  getLeaveRequestsByEmployee: (employeeId: string) => LeaveRequest[];
  getLeaveBalance: (employeeId: string) => number;
  getUsedLeaveDays: (employeeId: string) => number;
  resetAllData: () => void;
  refreshLeaveRequests: () => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error("useLeave must be used within a LeaveProvider");
  }
  return context;
};

const STORAGE_KEY = "leave_requests";

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load from localStorage on mount and when refreshKey changes
  useEffect(() => {
    const savedRequests = localStorage.getItem(STORAGE_KEY);
    if (savedRequests) {
      setLeaveRequests(JSON.parse(savedRequests));
    }
  }, [refreshKey]);

  // Save to localStorage whenever requests change
  useEffect(() => {
    if (leaveRequests.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leaveRequests));
    }
  }, [leaveRequests]);

  const refreshLeaveRequests = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const addLeaveRequest = useCallback(
    async (request: Omit<LeaveRequest, "id" | "status" | "appliedOn">) => {
      // First save to localStorage for immediate UI update
      const savedRequests = localStorage.getItem(STORAGE_KEY);
      const currentRequests = savedRequests ? JSON.parse(savedRequests) : [];
      
      const newRequest: LeaveRequest = {
        ...request,
        id: `LV${Date.now()}`,
        status: "pending",
        appliedOn: new Date().toISOString().split("T")[0],
        days: request.days || calculateDays(request.startDate, request.endDate),
      };
      
      const updatedRequests = [newRequest, ...currentRequests];
      setLeaveRequests(updatedRequests);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
      
      // Then try to save to database
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          await apiService.createLeaveRequest({
            employee_id: request.employeeId,
            employee_name: request.employeeId,
            leave_type: request.type,
            start_date: request.startDate,
            end_date: request.endDate,
            reason: request.reason,
            status: 'pending'
          });
          console.log('Leave request saved to database');
        }
      } catch (error) {
        console.error("Error saving to database:", error);
      }
    },
    []
  );

  const approveLeaveRequest = useCallback(async (requestId: string) => {
    // Update localStorage
    const savedRequests = localStorage.getItem(STORAGE_KEY);
    const currentRequests = savedRequests ? JSON.parse(savedRequests) : [];
    
    const updatedRequests = currentRequests.map((request: LeaveRequest) =>
      request.id === requestId ? { ...request, status: "approved" as const } : request
    );
    
    setLeaveRequests(updatedRequests);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
    
    // Update database
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await apiService.updateLeaveStatus(requestId, 'approved');
      }
    } catch (error) {
      console.error("Error updating database:", error);
    }
  }, []);

  const rejectLeaveRequest = useCallback(async (requestId: string) => {
    // Update localStorage
    const savedRequests = localStorage.getItem(STORAGE_KEY);
    const currentRequests = savedRequests ? JSON.parse(savedRequests) : [];
    
    const updatedRequests = currentRequests.map((request: LeaveRequest) =>
      request.id === requestId ? { ...request, status: "rejected" as const } : request
    );
    
    setLeaveRequests(updatedRequests);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
    
    // Update database
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await apiService.updateLeaveStatus(requestId, 'rejected');
      }
    } catch (error) {
      console.error("Error updating database:", error);
    }
  }, []);

  const getLeaveRequestsByEmployee = useCallback(
    (employeeId: string) => {
      return leaveRequests
        .filter((r) => r.employeeId === employeeId)
        .sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
    },
    [leaveRequests]
  );

  const getUsedLeaveDays = useCallback(
    (employeeId: string): number => {
      // Only count APPROVED leaves
      return leaveRequests
        .filter((r) => r.employeeId === employeeId && r.status === "approved")
        .reduce((total, leave) => {
          const days = leave.days || calculateDays(leave.startDate, leave.endDate);
          return total + days;
        }, 0);
    },
    [leaveRequests]
  );

  const getLeaveBalance = useCallback(
    (employeeId: string): number => {
      const usedDays = getUsedLeaveDays(employeeId);
      return Math.max(0, ANNUAL_LEAVE_QUOTA - usedDays);
    },
    [getUsedLeaveDays]
  );

  const resetAllData = useCallback(() => {
    setLeaveRequests([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <LeaveContext.Provider
      value={{
        leaveRequests,
        addLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        getLeaveRequestsByEmployee,
        getLeaveBalance,
        getUsedLeaveDays,
        resetAllData,
        refreshLeaveRequests,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};
