import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { AttendanceRecord } from "@/lib/mockData";
import { HelpTooltip } from "./HelpTooltip";

interface AttendanceHeatmapProps {
  records: AttendanceRecord[];
  month?: Date;
}

type DayStatus = "present" | "late" | "absent" | "leave" | "weekend" | "future";

const statusColors: Record<DayStatus, string> = {
  present: "bg-green-500/90",
  late: "bg-yellow-500/90",
  absent: "bg-red-500/90",
  leave: "bg-blue-500/90",
  weekend: "bg-muted/60",
  future: "bg-muted/20",
};

const statusLabels: Record<DayStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  leave: "On Leave",
  weekend: "Weekend",
  future: "Future",
};

export const AttendanceHeatmap = ({
  records,
  month = new Date(),
}: AttendanceHeatmapProps) => {
  const calendarDays = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayOfWeek = getDay(date);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isFuture = date > today;

      const record = records.find((r) => r.date === dateStr);

      let status: DayStatus;
      if (isFuture) {
        status = "future";
      } else if (isWeekend) {
        status = "weekend";
      } else if (record) {
        status = record.status as DayStatus;
      } else {
        // Check if it's a leave day (this would need leave context integration)
        status = "absent";
      }

      return {
        date,
        dateStr,
        dayOfMonth: format(date, "d"),
        status,
        record,
      };
    });
  }, [records, month]);

  // Calculate starting offset for the first week
  const firstDayOffset = getDay(startOfMonth(month));

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          Attendance Heatmap
          <HelpTooltip content="Visual overview of your monthly attendance. Colors indicate your status for each day." />
        </h3>
        <span className="text-xs text-muted-foreground">
          {format(month, "MMM yyyy")}
        </span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div
            key={`${day}-${i}`}
            className="text-center text-[10px] font-medium text-muted-foreground py-0.5"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="w-7 h-7" />
        ))}

        {/* Day cells */}
        {calendarDays.map((day) => (
          <div
            key={day.dateStr}
            className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-medium transition-all hover:scale-105 hover:ring-1 hover:ring-foreground/20 cursor-default border border-border/30 ${
              statusColors[day.status]
            } ${
              day.status === "present" || day.status === "late" || day.status === "absent" || day.status === "leave"
                ? "text-white"
                : "text-muted-foreground"
            }`}
            title={`${format(day.date, "MMM d")}: ${statusLabels[day.status]}`}
          >
            {day.dayOfMonth}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border/50">
        {(["present", "late", "absent", "leave"] as DayStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-sm ${statusColors[status]}`} />
            <span className="text-[10px] text-muted-foreground">
              {statusLabels[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
