import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AttendanceRecord } from "@/lib/mockData";

interface AttendanceContextType {
  records: AttendanceRecord[];
  addClockIn: (employeeId: string) => AttendanceRecord;
  addClockOut: (employeeId: string) => void;
  getRecordsByEmployee: (employeeId: string) => AttendanceRecord[];
  getTodayRecord: (employeeId: string) => AttendanceRecord | undefined;
  getKPIData: (employeeId: string, leaveBalance: number) => {
    presentDays: number;
    leaveBalance: number;
    lateArrivals: number;
    attendanceRate: number;
  };
  refreshRecords: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};

const STORAGE_KEY = "attendance_records";

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load records from localStorage on mount and when refreshKey changes
  useEffect(() => {
    const savedRecords = localStorage.getItem(STORAGE_KEY);
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, [refreshKey]);

  // Save records to localStorage whenever they change
  useEffect(() => {
    if (records.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  }, [records]);

  const refreshRecords = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const addClockIn = useCallback((employeeId: string): AttendanceRecord => {
    const now = new Date();
    const clockInTime = formatTime(now);
    const dateStr = formatDate(now);
    const dayName = formatDay(now);
    
    // Get fresh records from localStorage
    const savedRecords = localStorage.getItem(STORAGE_KEY);
    const currentRecords = savedRecords ? JSON.parse(savedRecords) : [];
    
    // Check if employee already clocked in today
    const existingRecord = currentRecords.find(
      (r: AttendanceRecord) => r.employeeId === employeeId && r.date === dateStr
    );
    
    if (existingRecord) {
      return existingRecord;
    }

    // Determine status based on clock-in time (assuming 9:00 AM is on time)
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hour > 9 || (hour === 9 && minutes > 15);

    const newRecord: AttendanceRecord = {
      id: `ATT${Date.now()}`,
      employeeId,
      date: dateStr,
      day: dayName,
      clockIn: clockInTime,
      status: isLate ? "late" : "present",
      location: "Office",
    };

    const updatedRecords = [newRecord, ...currentRecords];
    setRecords(updatedRecords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    return newRecord;
  }, []);

  const addClockOut = useCallback((employeeId: string) => {
    const now = new Date();
    const dateStr = formatDate(now);
    const clockOutTime = formatTime(now);

    // Get fresh records from localStorage
    const savedRecords = localStorage.getItem(STORAGE_KEY);
    const currentRecords = savedRecords ? JSON.parse(savedRecords) : [];

    const updatedRecords = currentRecords.map((record: AttendanceRecord) =>
      record.employeeId === employeeId && record.date === dateStr
        ? { ...record, clockOut: clockOutTime }
        : record
    );
    
    setRecords(updatedRecords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  }, []);

  const getRecordsByEmployee = useCallback(
    (employeeId: string) => {
      return records
        .filter((r) => r.employeeId === employeeId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    [records]
  );

  const getTodayRecord = useCallback(
    (employeeId: string) => {
      const today = formatDate(new Date());
      return records.find((r) => r.employeeId === employeeId && r.date === today);
    },
    [records]
  );

  const getKPIData = useCallback(
    (employeeId: string, leaveBalance: number = 20) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const employeeRecords = records.filter((r) => {
        const recordDate = new Date(r.date);
        return (
          r.employeeId === employeeId &&
          recordDate.getMonth() === currentMonth &&
          recordDate.getFullYear() === currentYear
        );
      });

      const presentDays = employeeRecords.filter(
        (r) => r.status === "present" || r.status === "late"
      ).length;
      const lateArrivals = employeeRecords.filter((r) => r.status === "late").length;

      // Calculate working days in current month (excluding weekends)
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      let workingDays = 0;
      for (let day = 1; day <= Math.min(now.getDate(), daysInMonth); day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
      }

      const attendanceRate = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;

      return {
        presentDays,
        leaveBalance,
        lateArrivals,
        attendanceRate,
      };
    },
    [records]
  );

  return (
    <AttendanceContext.Provider
      value={{
        records,
        addClockIn,
        addClockOut,
        getRecordsByEmployee,
        getTodayRecord,
        getKPIData,
        refreshRecords,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};
