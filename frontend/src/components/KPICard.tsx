import { LucideIcon } from "lucide-react";
import { HelpTooltip } from "@/components/employee/HelpTooltip";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  helpTooltip?: string;
}

export const KPICard = ({ title, value, subtitle, icon: Icon, iconColor, iconBgColor, helpTooltip }: KPICardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
            {title}
            {helpTooltip && <HelpTooltip content={helpTooltip} />}
          </p>
          <p className="text-3xl font-bold text-card-foreground mb-1">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};
