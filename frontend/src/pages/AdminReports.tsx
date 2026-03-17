import { useState, useEffect } from "react";
import { Bell, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAttendance } from "@/contexts/AttendanceContext";
import { useLeave } from "@/contexts/LeaveContext";
import { apiService } from "@/lib/supabase";
import * as XLSX from 'xlsx';

const AdminReports = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [totalEmployees, setTotalEmployees] = useState(0);
  const { toast } = useToast();
  const { records } = useAttendance();
  const { leaveRequests } = useLeave();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateAttendanceRate = (startDate: Date, endDate: Date) => {
    const filteredRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
    const uniqueDays = new Set(filteredRecords.map(r => r.date)).size;
    const workingDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return totalEmployees > 0 && workingDays > 0 ? Math.round((filteredRecords.length / (totalEmployees * workingDays)) * 100) : 0;
  };

  const today = new Date();
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const attendanceTrends = [
    { label: "This Week", percentage: calculateAttendanceRate(weekStart, today) },
    { label: "This Month", percentage: calculateAttendanceRate(monthStart, today) },
    { label: "Last Month", percentage: calculateAttendanceRate(lastMonthStart, lastMonthEnd) },
    { label: "Year Average", percentage: calculateAttendanceRate(yearStart, today) },
  ];

  const handleExportDaily = () => {
    const todayDate = today.toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === todayDate);
    
    const data = todayRecords.map(r => ({
      'Employee ID': r.employeeId,
      'Date': r.date,
      'Day': r.day,
      'Clock In': r.clockIn,
      'Clock Out': r.clockOut || 'N/A',
      'Status': r.status,
      'Location': r.location
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Summary');
    XLSX.writeFile(wb, `Daily_Report_${todayDate}.xlsx`);
    
    toast({
      title: "Export Complete",
      description: "Daily summary exported successfully",
    });
  };

  const handleExportWeekly = () => {
    const weekRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= weekStart && recordDate <= today;
    });
    
    const data = weekRecords.map(r => ({
      'Employee ID': r.employeeId,
      'Date': r.date,
      'Day': r.day,
      'Clock In': r.clockIn,
      'Clock Out': r.clockOut || 'N/A',
      'Status': r.status,
      'Location': r.location
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Weekly Report');
    XLSX.writeFile(wb, `Weekly_Report_${today.toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Complete",
      description: "Weekly report exported successfully",
    });
  };

  const handleExportMonthly = () => {
    const monthRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= monthStart && recordDate <= today;
    });
    
    const attendanceData = monthRecords.map(r => ({
      'Employee ID': r.employeeId,
      'Date': r.date,
      'Day': r.day,
      'Clock In': r.clockIn,
      'Clock Out': r.clockOut || 'N/A',
      'Status': r.status,
      'Location': r.location
    }));

    const leaveData = leaveRequests.filter(l => {
      const startDate = new Date(l.startDate);
      return startDate >= monthStart && startDate <= today;
    }).map(l => ({
      'Employee ID': l.employeeId,
      'Leave Type': l.type,
      'Start Date': l.startDate,
      'End Date': l.endDate,
      'Days': l.days,
      'Status': l.status,
      'Reason': l.reason
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(attendanceData);
    const ws2 = XLSX.utils.json_to_sheet(leaveData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Attendance');
    XLSX.utils.book_append_sheet(wb, ws2, 'Leaves');
    XLSX.writeFile(wb, `Monthly_Report_${today.toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Complete",
      description: "Monthly report exported successfully",
    });
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">{formatDate(currentTime)}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl md:text-2xl font-semibold text-foreground">{formatTime(currentTime)}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Current Time</p>
          </div>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Daily Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Generate today's attendance report</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleExportDaily}
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Weekly Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Generate this week's report</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleExportWeekly}
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Monthly Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Generate this month's report</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleExportMonthly}
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trends */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Attendance Trends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {attendanceTrends.map((trend) => (
            <div key={trend.label}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">{trend.label}</span>
                <span className="text-sm font-medium">{trend.percentage}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground rounded-full transition-all duration-500"
                  style={{ width: `${trend.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-3xl font-bold">{totalEmployees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Records</p>
            <p className="text-3xl font-bold">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Leave Requests</p>
            <p className="text-3xl font-bold">{leaveRequests.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
