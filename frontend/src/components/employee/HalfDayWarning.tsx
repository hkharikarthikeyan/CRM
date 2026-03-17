import { AlertTriangle } from "lucide-react";

interface HalfDayWarningProps {
  show: boolean;
}

export const HalfDayWarning = ({ show }: HalfDayWarningProps) => {
  if (!show) return null;

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
      <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
      <span className="text-warning-foreground">
        <strong>Warning:</strong> Today may count as Half-Day since it's after 1:00 PM.
      </span>
    </div>
  );
};

export const isAfterHalfDayThreshold = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 13; // After 1:00 PM
};
