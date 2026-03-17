import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/supabase";

interface AttendanceCorrection {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  original_clock_in: string;
  original_clock_out: string;
  requested_clock_in: string;
  requested_clock_out: string;
  reason: string;
  requested_on: string;
  status: "pending" | "approved" | "rejected";
}

const AdminAttendanceCorrections = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [corrections, setCorrections] = useState<AttendanceCorrection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCorrections();
  }, []);

  const fetchCorrections = async () => {
    try {
      const data = await apiService.getAttendanceCorrections();
      setCorrections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching corrections:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const pendingCount = corrections.filter((c) => c.status === "pending").length;
  const approvedCount = corrections.filter((c) => c.status === "approved").length;
  const rejectedCount = corrections.filter((c) => c.status === "rejected").length;

  const handleApprove = async (id: string) => {
    try {
      await apiService.updateCorrectionStatus(id, "approved");
      setCorrections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "approved" as const } : c))
      );
      toast({
        title: "Correction Approved",
        description: "The attendance correction has been approved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve correction",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiService.updateCorrectionStatus(id, "rejected");
      setCorrections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "rejected" as const } : c))
      );
      toast({
        title: "Correction Rejected",
        description: "The attendance correction has been rejected.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject correction",
        variant: "destructive",
      });
    }
  };

  const pendingCorrections = corrections.filter((c) => c.status === "pending");

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Attendance Corrections</h1>
          <p className="text-sm text-muted-foreground">{formatDay(currentTime)}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl md:text-2xl font-bold">{formatTime(currentTime)}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Current Time</p>
          </div>
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="p-3 md:p-6 text-center">
            <p className="text-amber-600 font-medium text-xs md:text-base">Pending</p>
            <p className="text-xl md:text-3xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-emerald-200 bg-emerald-50">
          <CardContent className="p-3 md:p-6 text-center">
            <p className="text-emerald-600 font-medium text-xs md:text-base">Approved</p>
            <p className="text-xl md:text-3xl font-bold text-emerald-600">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-3 md:p-6 text-center">
            <p className="text-destructive font-medium text-xs md:text-base">Rejected</p>
            <p className="text-xl md:text-3xl font-bold text-destructive">{rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Correction Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Correction Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : pendingCorrections.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending correction requests
            </p>
          ) : (
            pendingCorrections.map((correction) => (
              <Card key={correction.id} className="border">
                <CardContent className="p-6 space-y-4">
                  {/* Employee Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-lg">
                        {getInitials(correction.employee_name)}
                      </div>
                      <div>
                        <p className="font-semibold">{correction.employee_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Employee ID: {correction.employee_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{correction.date}</p>
                    </div>
                  </div>

                  {/* Time Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2 border-red-300 bg-red-50">
                      <CardContent className="p-4">
                        <p className="text-destructive font-medium mb-2">Original Times</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Clock In:</span>
                            <span className="font-medium">{correction.original_clock_in}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Clock Out:</span>
                            <span className="font-medium">{correction.original_clock_out}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-emerald-300 bg-emerald-50">
                      <CardContent className="p-4">
                        <p className="text-emerald-600 font-medium mb-2">Requested Times</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Clock In:</span>
                            <span className="font-medium">{correction.requested_clock_in}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Clock Out:</span>
                            <span className="font-medium">{correction.requested_clock_out}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Reason */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Reason for Correction:</p>
                    <p>{correction.reason}</p>
                  </div>

                  {/* Footer with Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-muted-foreground">
                      Requested on: {new Date(correction.requested_on).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(correction.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(correction.id)}
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAttendanceCorrections;
