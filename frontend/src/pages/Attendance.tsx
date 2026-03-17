import { Calendar, Clock, User, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { useLeave } from "@/contexts/LeaveContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AttendanceHeatmap } from "@/components/employee/AttendanceHeatmap";
import { HelpTooltip, helpContent } from "@/components/employee/HelpTooltip";
import { HalfDayWarning, isAfterHalfDayThreshold } from "@/components/employee/HalfDayWarning";
import { useSavedFilters } from "@/hooks/useSavedFilters";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const Attendance = () => {
  const { user, isAdmin } = useAuth();
  const { getRecordsByEmployee, addClockIn, getTodayRecord, getKPIData, refreshRecords } = useAttendance();
  const { getLeaveBalance } = useLeave();
  const { filters, updateFilter, clearFilters } = useSavedFilters("attendance");
  const { addActivity } = useActivityLog();
  const [showHalfDayWarning, setShowHalfDayWarning] = useState(false);

  const records = user ? getRecordsByEmployee(user.employeeId) : [];
  const todayRecord = user ? getTodayRecord(user.employeeId) : undefined;
  const leaveBalance = user ? getLeaveBalance(user.employeeId) : 20;
  const kpiData = user ? getKPIData(user.employeeId, leaveBalance) : { presentDays: 0, attendanceRate: 0 };

  const handleClockIn = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to clock in",
        variant: "destructive",
      });
      return;
    }

    if (todayRecord) {
      toast({
        title: "Already Clocked In",
        description: "You have already clocked in today.",
      });
      return;
    }

    // Check for half-day warning (after 1 PM)
    if (isAfterHalfDayThreshold()) {
      setShowHalfDayWarning(true);
    }

    // Check geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          try {
            const response = await fetch('http://localhost:8000/geofencing');
            const locations = await response.json();

            if (locations.length === 0) {
              // No geofencing configured
              const record = addClockIn(user.employeeId);
              if (!isAdmin) {
                if (record.status === "late") {
                  addActivity("late_arrival", `Clocked in late at ${record.clockIn}`);
                } else {
                  addActivity("clock_in", `Clocked in at ${record.clockIn}`);
                }
              }
              toast({
                title: "Clocked In Successfully",
                description: `Your attendance has been recorded at ${record.clockIn}`,
              });
              refreshRecords();
              return;
            }

            // Check if within any geofence
            const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
              const R = 6371e3;
              const φ1 = (lat1 * Math.PI) / 180;
              const φ2 = (lat2 * Math.PI) / 180;
              const Δφ = ((lat2 - lat1) * Math.PI) / 180;
              const Δλ = ((lon2 - lon1) * Math.PI) / 180;
              const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return R * c;
            };

            const isWithinGeofence = locations.some((loc: any) => {
              const distance = calculateDistance(userLat, userLng, loc.latitude, loc.longitude);
              return distance <= loc.radius;
            });

            if (isWithinGeofence) {
              const record = addClockIn(user.employeeId);
              if (!isAdmin) {
                if (record.status === "late") {
                  addActivity("late_arrival", `Clocked in late at ${record.clockIn}`);
                } else {
                  addActivity("clock_in", `Clocked in at ${record.clockIn}`);
                }
              }
              toast({
                title: "Clocked In Successfully",
                description: `Your attendance has been recorded at ${record.clockIn}`,
              });
              refreshRecords();
            } else {
              toast({
                title: "Location Error",
                description: "You are outside the allowed location. Please clock in from office.",
                variant: "destructive",
              });
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to verify location",
              variant: "destructive",
            });
          }
        },
        (error) => {
          toast({
            title: "Location Access Denied",
            description: "Please enable location access to clock in.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-50";
      case "late":
        return "text-yellow-600 bg-yellow-50";
      case "absent":
        return "text-red-600 bg-red-50";
      case "half-day":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDayName = (dateStr: string, recordDay?: string) => {
    if (recordDay) return recordDay;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Filter records based on saved filters
  const filteredRecords = records.filter((record) => {
    if (filters.status && record.status !== filters.status) return false;
    if (filters.month) {
      const recordMonth = record.date.substring(0, 7); // YYYY-MM
      if (recordMonth !== filters.month) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 md:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              My Attendance
              {!isAdmin && (
                <HelpTooltip content="Track your daily attendance records, clock-in times, and status." />
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Track your daily attendance records</p>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {/* Half-Day Warning - Employee Only */}
            {!isAdmin && !todayRecord && (
              <HalfDayWarning show={isAfterHalfDayThreshold()} />
            )}
            <Button 
              onClick={handleClockIn} 
              size="default" 
              className="gap-2 w-full sm:w-auto"
              disabled={!!todayRecord}
            >
              <Clock className="h-4 w-4" />
              {todayRecord ? "Clocked In Today" : "Clock In Now"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
            <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 flex items-center gap-1">
              Today's Status
              {!isAdmin && <HelpTooltip content={helpContent.attendanceStatus.present} />}
            </p>
            <p className={`text-lg md:text-2xl font-bold ${todayRecord ? "text-green-600" : "text-muted-foreground"}`}>
              {todayRecord ? "Present" : "Not Clocked In"}
            </p>
            {todayRecord && (
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                Clocked in at {todayRecord.clockIn}
              </p>
            )}
          </div>
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
            <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">This Week</p>
            <p className="text-lg md:text-2xl font-bold text-foreground">{records.length} Days</p>
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Total records</p>
          </div>
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
            <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">This Month</p>
            <p className="text-lg md:text-2xl font-bold text-foreground">{kpiData.presentDays} Days</p>
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{kpiData.attendanceRate}% attendance rate</p>
          </div>
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
            <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Total Records</p>
            <p className="text-lg md:text-2xl font-bold text-foreground">{records.length}</p>
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">All time</p>
          </div>
        </div>

        {/* Attendance Heatmap - Employee Only */}
        {!isAdmin && (
          <div className="mb-6 md:mb-8">
            <AttendanceHeatmap records={records} />
          </div>
        )}

        {/* Saved Filters - Employee Only */}
        {!isAdmin && (
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select
              value={filters.status || ""}
              onValueChange={(val) => updateFilter("status", val || undefined)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half-day">Half-Day</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.month || ""}
              onValueChange={(val) => updateFilter("month", val || undefined)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-12">December 2024</SelectItem>
                <SelectItem value="2024-11">November 2024</SelectItem>
                <SelectItem value="2024-10">October 2024</SelectItem>
              </SelectContent>
            </Select>
            {(filters.status || filters.month) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Attendance Records */}
        <div className="bg-card rounded-xl shadow-sm border border-border">
          <div className="p-4 md:p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Attendance History
              {!isAdmin && (
                <HelpTooltip content="Your complete attendance record history sorted by date (newest first)." />
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Your recent attendance records (newest first)</p>
          </div>

          <div className="p-4 md:p-6">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance records yet.</p>
                <p className="text-sm mt-1">Click "Clock In Now" to record your first attendance.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{formatDisplayDate(record.date)}</p>
                        <p className="text-sm text-muted-foreground">{getDayName(record.date, record.day)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>In: {record.clockIn}</span>
                      </div>
                      {record.clockOut && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Out: {record.clockOut}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{record.employeeId}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Attendance;
