import { useState, useEffect } from "react";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/supabase";
import { useAttendance } from "@/contexts/AttendanceContext";
import * as XLSX from 'xlsx';

const Reports = () => {
  const { user } = useAuth();
  const { getRecordsByEmployee } = useAttendance();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const attendanceRecords = user ? getRecordsByEmployee(user.employeeId) : [];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const leaveData = await apiService.getLeaveRequests();
      const userLeaves = leaveData.filter((l: any) => l.employee_id === user?.employeeId);
      setLeaves(userLeaves || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start: string, end: string): number => {
    const startD = new Date(start);
    const endD = new Date(end);
    return Math.ceil(Math.abs(endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const approvedDays = leaves.filter((l) => l.status === "approved").reduce((acc, l) => acc + calculateDays(l.start_date, l.end_date), 0);
  const pendingDays = leaves.filter((l) => l.status === "pending").reduce((acc, l) => acc + calculateDays(l.start_date, l.end_date), 0);
  const rejectedDays = leaves.filter((l) => l.status === "rejected").reduce((acc, l) => acc + calculateDays(l.start_date, l.end_date), 0);
  const totalLeaves = 20;
  const remainingLeaves = totalLeaves - approvedDays;

  const handleExportToExcel = () => {
    const attendanceData = attendanceRecords.map(record => ({
      'Date': record.date,
      'Day': record.day,
      'Clock In': record.clockIn,
      'Clock Out': record.clockOut || 'N/A',
      'Status': record.status,
      'Location': record.location
    }));

    const leaveData = leaves.map(leave => ({
      'Leave Type': leave.leave_type,
      'Start Date': leave.start_date,
      'End Date': leave.end_date,
      'Days': calculateDays(leave.start_date, leave.end_date),
      'Reason': leave.reason,
      'Status': leave.status
    }));

    const summaryData = [
      { 'Metric': 'Total Leaves', 'Value': totalLeaves },
      { 'Metric': 'Approved Days', 'Value': approvedDays },
      { 'Metric': 'Pending Days', 'Value': pendingDays },
      { 'Metric': 'Rejected Days', 'Value': rejectedDays },
      { 'Metric': 'Remaining Leaves', 'Value': remainingLeaves },
      { 'Metric': 'Total Attendance Records', 'Value': attendanceRecords.length }
    ];

    const wb = XLSX.utils.book_new();
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    const attendanceWs = XLSX.utils.json_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(wb, attendanceWs, 'Attendance');
    const leaveWs = XLSX.utils.json_to_sheet(leaveData);
    XLSX.utils.book_append_sheet(wb, leaveWs, 'Leave Requests');
    const fileName = `${user?.name || 'Employee'}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Group leaves by month
  const monthlyData = leaves.reduce((acc: any, leave) => {
    const month = new Date(leave.start_date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = { approved: 0, pending: 0, rejected: 0 };
    const days = calculateDays(leave.start_date, leave.end_date);
    if (leave.status === 'approved') acc[month].approved += days;
    if (leave.status === 'pending') acc[month].pending += days;
    if (leave.status === 'rejected') acc[month].rejected += days;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard & Reports</h1>
            <p className="text-gray-600 mt-1">View attendance summaries and analytics</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleExportToExcel}>
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-gray-700 font-medium mb-2 block">Time Period</label>
              <Select defaultValue="monthly">
                <SelectTrigger className="bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-gray-700 font-medium mb-2 block">Start Date</label>
              <Input type="date" className="bg-gray-50" />
            </div>
            <div>
              <label className="text-gray-700 font-medium mb-2 block">End Date</label>
              <Input type="date" className="bg-gray-50" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-600 text-sm mb-2">Total Leaves</p>
                <p className="text-5xl font-bold text-gray-900 mb-2">{totalLeaves}</p>
                <p className="text-gray-600 text-sm">Annual quota</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-600 text-sm mb-2">Approved Days</p>
                <p className="text-5xl font-bold text-green-600 mb-2">{approvedDays}</p>
                <p className="text-green-600 text-sm">Leaves taken</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-600 text-sm mb-2">Pending Days</p>
                <p className="text-5xl font-bold text-yellow-600 mb-2">{pendingDays}</p>
                <p className="text-gray-600 text-sm">Awaiting approval</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-600 text-sm mb-2">Remaining Leaves</p>
                <p className="text-5xl font-bold text-blue-600 mb-2">{remainingLeaves}</p>
                <p className="text-blue-600 text-sm">Available to use</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Leave Trend</h3>
              <div className="space-y-4">
                {Object.entries(monthlyData).map(([month, data]: [string, any]) => {
                  const total = data.approved + data.pending + data.rejected;
                  return (
                    <div key={month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{month}</span>
                        <span className="text-gray-600">{total} days</span>
                      </div>
                      <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-gray-100">
                        {data.approved > 0 && (
                          <div
                            className="bg-green-500"
                            style={{ width: `${(data.approved / total) * 100}%` }}
                            title={`Approved: ${data.approved}`}
                          />
                        )}
                        {data.pending > 0 && (
                          <div
                            className="bg-yellow-500"
                            style={{ width: `${(data.pending / total) * 100}%` }}
                            title={`Pending: ${data.pending}`}
                          />
                        )}
                        {data.rejected > 0 && (
                          <div
                            className="bg-red-500"
                            style={{ width: `${(data.rejected / total) * 100}%` }}
                            title={`Rejected: ${data.rejected}`}
                          />
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>✓ Approved: {data.approved}</span>
                        <span>⏳ Pending: {data.pending}</span>
                        <span>✗ Rejected: {data.rejected}</span>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(monthlyData).length === 0 && (
                  <p className="text-center py-8 text-gray-600">No leave data available</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;
