import { useState, useEffect } from "react";
import { Plus, Bell, Search, Check, X } from "lucide-react";
import { employees } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useLeave } from "@/contexts/LeaveContext";

const AdminLeaveRequests = () => {
  const { leaveRequests, approveLeaveRequest, rejectLeaveRequest, addLeaveRequest } = useLeave();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startD = new Date(start);
    const endD = new Date(end);
    const diffTime = Math.abs(endD.getTime() - startD.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleNewLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const days = calculateDays(startDate, endDate);

    addLeaveRequest({
      employeeId: selectedEmployee,
      type: (leaveType || "casual") as "sick" | "casual" | "earned" | "vacation" | "personal" | "unpaid",
      startDate,
      endDate,
      reason: reason || "Leave request",
      days,
    });

    toast({
      title: "Leave Request Submitted",
      description: "New leave request has been submitted successfully.",
    });

    setSelectedEmployee("");
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setOpen(false);
  };

  const handleApprove = (id: string) => {
    approveLeaveRequest(id);
    toast({
      title: "Leave Approved",
      description: "The leave request has been approved.",
    });
  };

  const handleReject = (id: string) => {
    rejectLeaveRequest(id);
    toast({
      title: "Leave Rejected",
      description: "The leave request has been rejected.",
      variant: "destructive",
    });
  };

  const filteredLeaves = leaveRequests.filter((leave) => {
    const employee = employees.find((emp) => emp.employeeId === leave.employeeId);
    return (
      employee?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const pendingCount = leaveRequests.filter((l) => l.status === "pending").length;
  const approvedCount = leaveRequests.filter((l) => l.status === "approved").length;
  const rejectedCount = leaveRequests.filter((l) => l.status === "rejected").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getLeaveTypeDisplay = (type: string) => {
    const types: { [key: string]: string } = {
      sick: "Sick Leave",
      casual: "Casual Leave",
      earned: "Earned Leave",
      vacation: "Vacation Leave",
      personal: "Personal Leave",
      unpaid: "Unpaid Leave",
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Leave Requests</h1>
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
        {/* Search and New Request Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search leave requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-muted/30"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 h-12 px-6">
                <Plus className="h-5 w-5" />
                New Leave Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>New Leave Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNewLeaveRequest} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger id="employee">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.employeeId}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger id="leave-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="earned">Earned Leave</SelectItem>
                      <SelectItem value="vacation">Vacation Leave</SelectItem>
                      <SelectItem value="personal">Personal Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input 
                      id="start-date" 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input 
                      id="end-date" 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Total Days: <span className="font-semibold text-foreground">{calculateDays(startDate, endDate)}</span>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input 
                    id="reason" 
                    placeholder="Enter reason for leave" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border text-center">
            <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Pending</p>
            <p className="text-2xl md:text-4xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border text-center">
            <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Approved</p>
            <p className="text-2xl md:text-4xl font-bold text-green-600">{approvedCount}</p>
          </div>
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border text-center">
            <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Rejected</p>
            <p className="text-2xl md:text-4xl font-bold text-red-600">{rejectedCount}</p>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Leave Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Start Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    End Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Days
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                      No leave requests yet. Employees can submit requests from their portal.
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave) => {
                    const employee = employees.find((emp) => emp.employeeId === leave.employeeId);
                    const initials = employee?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "??";

                    return (
                      <tr key={leave.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{employee?.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{leave.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {getLeaveTypeDisplay(leave.type)}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{leave.startDate}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{leave.endDate}</td>
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {leave.days}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{leave.reason}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                              leave.status
                            )}`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {leave.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleApprove(leave.id)}
                                size="sm"
                                className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReject(leave.id)}
                                size="sm"
                                variant="outline"
                                className="gap-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLeaveRequests;
