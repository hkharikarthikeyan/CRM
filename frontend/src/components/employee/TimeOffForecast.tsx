import { CalendarCheck } from "lucide-react";

interface TimeOffForecastProps {
  currentBalance: number;
  requestedDays: number;
}

export const TimeOffForecast = ({
  currentBalance,
  requestedDays,
}: TimeOffForecastProps) => {
  const remainingAfterRequest = currentBalance - requestedDays;

  if (requestedDays <= 0) return null;

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
        remainingAfterRequest >= 0
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive"
      }`}
    >
      <CalendarCheck className="h-4 w-4" />
      <span>
        Remaining leave after this request:{" "}
        <strong>{Math.max(0, remainingAfterRequest)} days</strong>
      </span>
    </div>
  );
};
