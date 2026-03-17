import { useState, useEffect, useCallback } from "react";

export interface Activity {
  id: string;
  type: "leave_applied" | "leave_approved" | "leave_rejected" | "clock_in" | "clock_out" | "late_arrival";
  message: string;
  timestamp: string;
}

const STORAGE_KEY = "employee_activity_log";
const MAX_ACTIVITIES = 5;

export const useActivityLog = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Load activities from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setActivities(JSON.parse(saved));
    }
  }, []);

  // Save activities to localStorage
  const saveActivities = useCallback((newActivities: Activity[]) => {
    const trimmed = newActivities.slice(0, MAX_ACTIVITIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    setActivities(trimmed);
  }, []);

  const addActivity = useCallback((type: Activity["type"], message: string) => {
    const newActivity: Activity = {
      id: `ACT${Date.now()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => {
      const updated = [newActivity, ...prev].slice(0, MAX_ACTIVITIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearActivities = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setActivities([]);
  }, []);

  return { activities, addActivity, clearActivities };
};
