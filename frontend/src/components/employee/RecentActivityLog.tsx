import { Activity, Clock, Calendar, AlertCircle, Check, X, LogIn, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Activity as ActivityType } from "@/hooks/useActivityLog";

interface RecentActivityLogProps {
  activities: ActivityType[];
}

const getActivityIcon = (type: ActivityType["type"]) => {
  switch (type) {
    case "leave_applied":
      return <Calendar className="h-4 w-4 text-blue-500" />;
    case "leave_approved":
      return <Check className="h-4 w-4 text-green-500" />;
    case "leave_rejected":
      return <X className="h-4 w-4 text-red-500" />;
    case "clock_in":
      return <LogIn className="h-4 w-4 text-green-500" />;
    case "clock_out":
      return <LogOut className="h-4 w-4 text-blue-500" />;
    case "late_arrival":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

export const RecentActivityLog = ({ activities }: RecentActivityLogProps) => {
  if (activities.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No recent activity to show.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
