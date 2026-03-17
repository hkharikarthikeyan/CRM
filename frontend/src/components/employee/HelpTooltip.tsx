import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
  className?: string;
}

export const HelpTooltip = ({ content, className = "" }: HelpTooltipProps) => {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted/80 hover:bg-muted transition-colors ${className}`}
          >
            <HelpCircle className="h-2.5 w-2.5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Predefined help content
export const helpContent = {
  leaveTypes: {
    sick: "Sick Leave is for health-related absences. Usually requires medical documentation for extended periods.",
    casual: "Casual Leave is for personal matters and short-notice absences. Limited per year.",
    earned: "Earned Leave accumulates based on your service period. Can be carried forward.",
    vacation: "Vacation Leave is for planned holidays and trips. Should be requested in advance.",
    personal: "Personal Leave is for important personal matters like family emergencies.",
    unpaid: "Unpaid Leave is when you need time off but have exhausted other leave types. No salary for these days.",
  },
  attendanceStatus: {
    present: "You clocked in on time (before 9:15 AM).",
    late: "You clocked in after 9:15 AM.",
    absent: "No attendance record for this day.",
    halfDay: "Worked less than half the required hours.",
  },
  rules: {
    clockIn: "Standard clock-in time is 9:00 AM. Arriving after 9:15 AM marks you as late.",
    halfDay: "Clocking in after 1:00 PM may count as a half-day attendance.",
    leaveBalance: "You start with 20 leave days per year. Approved leaves are deducted from this balance.",
  },
};
