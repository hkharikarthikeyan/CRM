import { useState, useEffect } from "react";
import { Users, Calendar, Clock, Bell, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAttendance } from "@/contexts/AttendanceContext";
import { useLeave } from "@/contexts/LeaveContext";
import { apiService } from "@/lib/supabase";

const Admin = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [totalEmployees, setTotalEmployees] = useState(0);
  const { records } = useAttendance();
  const { leaveRequests, approveLeaveRequest, rejectLeaveRequest } = useLeave();

  const pendingLeaves = leaveRequests.filter((leave) => leave.status === "pending");
  const todayDate = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === todayDate);
  const presentToday = todayRecords.length;
  const onLeave = leaveRequests.filter(l => l.status === 'approved' && l.startDate <= todayDate && l.endDate >= todayDate).length;
  const absentToday = totalEmployees - presentToday - onLeave;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  const recentCheckIns = todayRecords.slice(0, 3).map(record => {
    const name = record.employeeId;
    const initials = name.substring(0, 2).toUpperCase();
    return {
      id: record.id,
      name: name,
      time: record.clockIn,
      status: record.status,
      initials: initials
    };
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await apiService.getEmployees();
        setTotalEmployees(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "long",
      month: "long", 
      day: "numeric",
      year: "numeric" 
    });
  };

  const handleClockIn = () => {
    toast({
      title: "Clocked In",
      description: `You clocked in at ${formatTime(currentTime)}`,
    });
  };

  const handleApproveLeave = async (id: string) => {
    await approveLeaveRequest(id);
    toast({
      title: "Leave Approved",
      description: "The leave request has been approved.",
    });
  };

  const handleRejectLeave = async (id: string) => {
    await rejectLeaveRequest(id);
    toast({
      title: "Leave Rejected",
      description: "The leave request has been rejected.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(currentTime)}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xl md:text-2xl font-bold text-foreground">{formatTime(currentTime)}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Current Time</p>
            </div>
            <Button variant="ghost" size="icon" className="relative hidden sm:flex">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Clock Card - Spans 1 column */}
          <div className="bg-gradient-primary rounded-2xl p-8 text-white shadow-lg flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6">
              <Clock className="h-10 w-10" />
            </div>
            <p className="text-5xl font-bold mb-2">{formatTime(currentTime)}</p>
            <p className="text-xl opacity-90 mb-6">{formatDay(currentTime)}</p>
            <Button
              onClick={handleClockIn}
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-6 text-lg rounded-xl shadow-md gap-2"
            >
              <Clock className="h-5 w-5" />
              Clock In
            </Button>
          </div>

          {/* KPI Cards Grid - Spans 2 columns */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3 md:gap-4">
            {/* Total Employees */}
            <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Total Employees</p>
                  <p className="text-2xl md:text-4xl font-bold text-foreground mb-1">{totalEmployees}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">All active employees</p>
                </div>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 md:h-7 md:w-7 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Present Today */}
            <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Present Today</p>
                  <p className="text-2xl md:text-4xl font-bold text-foreground mb-1">{presentToday}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 hidden sm:flex">
                    <TrendingUp className="h-3 w-3" />
                    Checked in
                  </p>
                </div>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 md:h-7 md:w-7 text-green-600" />
                </div>
              </div>
            </div>

            {/* Absent */}
            <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Absent</p>
                  <p className="text-2xl md:text-4xl font-bold text-foreground mb-1">{absentToday}</p>
                  <p className="text-xs text-red-600 hidden sm:block">Need attention</p>
                </div>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 md:h-7 md:w-7 text-red-600" />
                </div>
              </div>
            </div>

            {/* On Leave */}
            <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">On Leave</p>
                  <p className="text-2xl md:text-4xl font-bold text-foreground mb-1">{onLeave}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">Approved leaves</p>
                </div>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 md:h-7 md:w-7 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Today's Attendance Rate */}
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">Today's Attendance Rate</h2>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-foreground">{attendanceRate}%</p>
              </div>
              <Progress value={attendanceRate} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {presentToday} out of {totalEmployees} employees have checked in today
              </p>
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">Recent Check-ins</h2>
            <div className="space-y-4">
              {recentCheckIns.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No check-ins today</p>
              ) : (
                recentCheckIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                        {checkIn.initials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{checkIn.name}</p>
                        <p className="text-sm text-muted-foreground">{checkIn.time}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        checkIn.status === "present"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {checkIn.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border mt-4 md:mt-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-foreground">Pending Leave Requests</h2>
            {pendingLeaves.length > 0 && (
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                {pendingLeaves.length}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {pendingLeaves.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No pending leave requests</p>
            ) : (
              pendingLeaves.map((leave) => {
                const initials = leave.employeeId.substring(0, 2).toUpperCase();
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold text-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm md:text-base">{leave.employeeId}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {leave.startDate} - {leave.endDate} ({days} days)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-13 sm:ml-0">
                      <Button
                        onClick={() => handleApproveLeave(leave.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 text-sm"
                        size="sm"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectLeave(leave.id)}
                        variant="outline"
                        className="border-border hover:bg-muted text-sm"
                        size="sm"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
