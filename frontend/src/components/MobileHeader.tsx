import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
  const { isAdmin } = useAuth();

  return (
    <header className="lg:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="h-6 w-6" />
      </Button>
      <h1 className="text-lg font-bold text-foreground">
        {isAdmin ? "Admin Portal" : "Employee Portal"}
      </h1>
      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
      </Button>
    </header>
  );
};
