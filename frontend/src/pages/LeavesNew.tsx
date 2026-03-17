import { useState, useEffect } from "react";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/supabase";

const LeavesNew = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateDays = (start: string, end: string): number => {
    const startD = new Date(start);
    const endD = new Date(end);
    const diffTime = Math.abs(endD.getTime() - startD.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const approvedDays = leaves
    .filter((l) => l.status === "approved")
    .reduce((acc, l) => acc + calculateDays(l.start_date, l.end_date), 0);

  const pendingDays = leaves
    .filter((l) => l.status === "pending")
    .reduce((acc, l) => acc + calculateDays(l.start_date, l.end_date), 0);

  const totalLeaves = 20;
  const remainingLeaves = totalLeaves - approvedDays;

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = await apiService.getLeaveRequests();
      if (Array.isArray(data)) {
        const userLeaves = data.filter((l: any) => l.employee_id === user?.employeeId);
        setLeaves(userLeaves || []);
      } else {
        setLeaves([]);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createLeaveRequest({
        employee_id: user?.employeeId,
        employee_name: user?.name,
        leave_type: leaveType || "casual",
        start_date: startDate,
        end_date: endDate,
        reason: reason
      });
      toast({
        title: "Leave Request Submitted",
        description: "Your leave request has been submitted for approval.",
      });
      setOpen(false);
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      fetchLeaves();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Leaves</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your leave requests</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
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
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="earned">Earned Leave</SelectItem>
                      <SelectItem value="vacation">Vacation</SelectItem>
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

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea 
                    id="reason" 
                    placeholder="Enter reason for leave" 
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
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
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Total Leaves</p>
            <p className="text-4xl font-bold text-foreground">{totalLeaves}</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Remaining Leaves</p>
            <p className="text-4xl font-bold text-green-600">{remainingLeaves}</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Pending Approval</p>
            <p className="text-4xl font-bold text-yellow-600">{pendingDays}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Leave Requests</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leave requests yet. Click "Request Leave" to submit one.
              </div>
            ) : (
              <div className="space-y-4">
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{leave.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          {leave.start_date} to {leave.end_date} • {leave.leave_type}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
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

export default LeavesNew;
