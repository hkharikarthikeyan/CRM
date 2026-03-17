import { useState, useEffect } from "react";
import { Bell, Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/lib/supabase";

const AdminLeaveRequestsNew = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = await apiService.getLeaveRequests();
      setLeaves(data || []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiService.updateLeaveStatus(id, "approved");
      toast({ title: "Leave Approved", description: "The leave request has been approved." });
      fetchLeaves();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve leave", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiService.updateLeaveStatus(id, "rejected");
      toast({ title: "Leave Rejected", description: "The leave request has been rejected.", variant: "destructive" });
      fetchLeaves();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject leave", variant: "destructive" });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredLeaves = leaves.filter((leave) =>
    leave.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    leave.leave_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    leave.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "rejected").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave Requests</h1>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(currentTime)}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{formatTime(currentTime)}</p>
              <p className="text-sm text-muted-foreground">Current Time</p>
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search leave requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Pending</p>
            <p className="text-4xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Approved</p>
            <p className="text-4xl font-bold text-green-600">{approvedCount}</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Rejected</p>
            <p className="text-4xl font-bold text-red-600">{rejectedCount}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Leave Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Start Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">End Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Reason</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No leave requests found</td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{leave.employee_name}</p>
                        <p className="text-xs text-muted-foreground">{leave.employee_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{leave.leave_type}</td>
                    <td className="px-6 py-4 text-sm">{leave.start_date}</td>
                    <td className="px-6 py-4 text-sm">{leave.end_date}</td>
                    <td className="px-6 py-4 text-sm">{leave.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {leave.status === "pending" && (
                        <div className="flex gap-2">
                          <Button onClick={() => handleApprove(leave.id)} size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button onClick={() => handleReject(leave.id)} size="sm" variant="outline" className="gap-1 text-red-600">
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminLeaveRequestsNew;
