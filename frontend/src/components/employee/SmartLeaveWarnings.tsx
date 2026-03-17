import { AlertTriangle, Sun, Calendar } from "lucide-react";
import { getHolidayName, isSunday, isSaturday } from "@/lib/holidays";

interface SmartLeaveWarningsProps {
  startDate: string;
  endDate: string;
  requestedDays: number;
  availableDays: number;
}

interface Warning {
  type: "weekend" | "holiday" | "balance";
  icon: React.ReactNode;
  message: string;
}

export const SmartLeaveWarnings = ({
  startDate,
  endDate,
  requestedDays,
  availableDays,
}: SmartLeaveWarningsProps) => {
  const warnings: Warning[] = [];

  if (startDate) {
    // Check if start date is a Sunday
    if (isSunday(startDate)) {
      warnings.push({
        type: "weekend",
        icon: <Sun className="h-4 w-4" />,
        message: `Start date (${startDate}) is a Sunday.`,
      });
    }
    // Check if start date is a Saturday
    if (isSaturday(startDate)) {
      warnings.push({
        type: "weekend",
        icon: <Sun className="h-4 w-4" />,
        message: `Start date (${startDate}) is a Saturday.`,
      });
    }
    // Check if start date is a holiday
    const startHoliday = getHolidayName(startDate);
    if (startHoliday) {
      warnings.push({
        type: "holiday",
        icon: <Calendar className="h-4 w-4" />,
        message: `Start date is ${startHoliday} (holiday).`,
      });
    }
  }

  if (endDate && endDate !== startDate) {
    // Check if end date is a Sunday
    if (isSunday(endDate)) {
      warnings.push({
        type: "weekend",
        icon: <Sun className="h-4 w-4" />,
        message: `End date (${endDate}) is a Sunday.`,
      });
    }
    // Check if end date is a Saturday
    if (isSaturday(endDate)) {
      warnings.push({
        type: "weekend",
        icon: <Sun className="h-4 w-4" />,
        message: `End date (${endDate}) is a Saturday.`,
      });
    }
    // Check if end date is a holiday
    const endHoliday = getHolidayName(endDate);
    if (endHoliday) {
      warnings.push({
        type: "holiday",
        icon: <Calendar className="h-4 w-4" />,
        message: `End date is ${endHoliday} (holiday).`,
      });
    }
  }

  // Check balance warning
  if (requestedDays > 0 && requestedDays > availableDays) {
    warnings.push({
      type: "balance",
      icon: <AlertTriangle className="h-4 w-4" />,
      message: `You are applying for ${requestedDays} days, but only ${availableDays} days are available.`,
    });
  }

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((warning, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 p-2 rounded-md text-sm ${
            warning.type === "balance"
              ? "bg-destructive/10 text-destructive"
              : "bg-warning/10 text-warning-foreground"
          }`}
        >
          {warning.icon}
          <span>{warning.message}</span>
        </div>
      ))}
    </div>
  );
};
