import { useState, useEffect } from "react";
import { Calendar, Plus, Clock, Check, X, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SmartLeaveWarnings } from "@/components/employee/SmartLeaveWarnings";
import { TimeOffForecast } from "@/components/employee/TimeOffForecast";
import { HelpTooltip, helpContent } from "@/components/employee/HelpTooltip";
import { useSavedFilters } from "@/hooks/useSavedFilters";
import { useActivityLog } from "@/hooks/useActivityLog";

const Leaves = () => {
  const { user, isAdmin } = useAuth();
  const { getLeaveRequestsByEmployee, addLeaveRequest, approveLeaveRequest, rejectLeaveRequest, getLeaveBalance, getUsedLeaveDays, resetAllData, leaveRequests, refreshLeaveRequests } = useLeave();
  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const { filters, updateFilter, clearFilters } = useSavedFilters("leaves");
  const { addActivity } = useActivityLog();

  const employeeId = user?.employeeId || "";
  const leaves = isAdmin ? leaveRequests : getLeaveRequestsByEmployee(employeeId);
  const leaveBalance = getLeaveBalance(employeeId);
  const usedDays = getUsedLeaveDays(employeeId);

  // Apply saved filters on mount
  useEffect(() => {
    if (filters.leaveType) setLeaveType(filters.leaveType);
  }, [filters.leaveType]);

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startD = new Date(start);
    const endD = new Date(end);
    const diffTime = Math.abs(endD.getTime() - startD.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const requestedDays = calculateDays(startDate, endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates.",
        variant: "destructive",
      });
      return;
    }

    const days = calculateDays(startDate, endDate);
    
    if (days > leaveBalance) {
      toast({
        title: "Insufficient Leave Balance",
        description: `You only have ${leaveBalance} days available. Requested: ${days} days.`,
        variant: "destructive",
      });
      return;
    }

    await addLeaveRequest({
      employeeId,
      type: (leaveType || "casual") as "sick" | "casual" | "earned" | "vacation" | "personal" | "unpaid",
      startDate,
      endDate,
      reason: reason || "Leave request",
      days,
    });

    // Log activity for employees
    if (!isAdmin) {
      addActivity("leave_applied", `Applied for ${days} days of ${leaveType || "casual"} leave`);
    }

    toast({
      title: "Leave Request Submitted",
      description: `Your request for ${days} days has been submitted for approval.`,
    });

    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setOpen(false);
    refreshLeaveRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "sick":
        return "text-red-600 bg-red-50";
      case "vacation":
        return "text-blue-600 bg-blue-50";
      case "personal":
        return "text-purple-600 bg-purple-50";
      case "casual":
        return "text-green-600 bg-green-50";
      case "earned":
        return "text-teal-600 bg-teal-50";
      case "unpaid":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const pendingDays = leaves
    .filter((l) => l.status === "pending")
    .reduce((acc, l) => acc + (l.days || 0), 0);

  const handleApprove = async (requestId: string) => {
    await approveLeaveRequest(requestId);
    toast({
      title: "Leave Approved",
      description: "The leave request has been approved and balance updated.",
    });
    refreshLeaveRequests();
  };

  const handleReject = async (requestId: string) => {
    await rejectLeaveRequest(requestId);
    toast({
      title: "Leave Rejected",
      description: "The leave request has been rejected.",
      variant: "destructive",
    });
    refreshLeaveRequests();
  };

  const handleResetAll = () => {
    resetAllData();
    toast({
      title: "Data Reset",
      description: "All leave data has been cleared. Starting fresh!",
    });
    refreshLeaveRequests();
  };

  // Filter leaves based on saved filters
  const filteredLeaves = leaves.filter((leave) => {
    if (filters.status && leave.status !== filters.status) return false;
    if (filters.leaveType && leave.type !== filters.leaveType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 md:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              My Leaves
              {!isAdmin && (
                <HelpTooltip content="Manage your leave requests. You can apply for different types of leave and track their status here." />
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your leave requests</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="default" className="gap-2" id="leave-request-btn">
                  <Plus className="h-4 w-4" />
                  Request Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Submit Leave Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="leave-type" className="flex items-center gap-2">
                      Leave Type (Optional)
                      {!isAdmin && (
                        <HelpTooltip content="Different leave types have different policies. Choose the one that best fits your situation." />
                      )}
                    </Label>
                    <Select value={leaveType} onValueChange={setLeaveType}>
                      <SelectTrigger id="leave-type">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sick">
                          <span className="flex items-center gap-2">
                            Sick Leave
                            {!isAdmin && <span className="text-xs text-muted-foreground">- Health related</span>}
                          </span>
                        </SelectItem>
                        <SelectItem value="casual">Casual Leave</SelectItem>
                        <SelectItem value="earned">Earned Leave</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
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

                  {/* Smart Leave Warnings - Employee Only */}
                  {!isAdmin && (startDate || endDate) && (
                    <SmartLeaveWarnings
                      startDate={startDate}
                      endDate={endDate}
                      requestedDays={requestedDays}
                      availableDays={leaveBalance}
                    />
                  )}

                  {startDate && endDate && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Total Days: <span className="font-semibold text-foreground">{calculateDays(startDate, endDate)}</span>
                      </p>
                    </div>
                  )}

                  {/* Time-Off Forecast - Employee Only */}
                  {!isAdmin && requestedDays > 0 && (
                    <TimeOffForecast
                      currentBalance={leaveBalance}
                      requestedDays={requestedDays}
                    />
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea 
                      id="reason" 
                      placeholder="Enter reason for leave" 
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit Request</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="default" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reset All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Leave Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all leave requests and reset leave balances to 20 days. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetAll}>Reset All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
              Annual Leave Quota
              {!isAdmin && <HelpTooltip content="Total leave days allocated to you per year." />}
            </p>
            <p className="text-3xl font-bold text-foreground">20 Days</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
              Remaining Balance
              {!isAdmin && <HelpTooltip content="Leave days you can still apply for this year." />}
            </p>
            <p className="text-3xl font-bold text-green-600">{leaveBalance} Days</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
              Used (Approved)
              {!isAdmin && <HelpTooltip content="Leave days that have been approved and deducted." />}
            </p>
            <p className="text-3xl font-bold text-foreground">{usedDays} Days</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
              Pending Approval
              {!isAdmin && <HelpTooltip content="Leave requests waiting for manager approval." />}
            </p>
            <p className="text-3xl font-bold text-yellow-600">{pendingDays} Days</p>
          </div>
        </div>

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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.leaveType || ""}
              onValueChange={(val) => updateFilter("leaveType", val || undefined)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Leave Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="earned">Earned</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            {(filters.status || filters.leaveType) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}

        <div className="bg-card rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              {isAdmin ? "All Leave Requests" : "Leave Requests"}
              {!isAdmin && (
                <HelpTooltip content="Your submitted leave requests and their current status." />
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdmin ? "Manage all employee leave requests" : "Your leave request history"}
            </p>
          </div>

          <div className="p-6">
            {filteredLeaves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leave requests yet. Click "Request Leave" to submit one.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">{leave.reason}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(leave.type)}`}>
                            {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {leave.startDate} to {leave.endDate} ({leave.days} days)
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Applied on {leave.appliedOn}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAdmin && leave.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(leave.id)}
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReject(leave.id)}
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
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

export default Leaves;
