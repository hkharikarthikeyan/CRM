import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* Mobile Header - Fixed at top */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        </div>
      )}
      
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isMobile ? 'pt-14' : ''}`}>
        {children}
      </div>
    </div>
  );
};
