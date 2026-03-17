import { ClockCard } from "@/components/ClockCard";
import { KPICard } from "@/components/KPICard";
import { ProfileCard } from "@/components/ProfileCard";
import { CheckCircle2, Calendar, AlertCircle, TrendingUp, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { useLeave } from "@/contexts/LeaveContext";
import { RecentActivityLog } from "@/components/employee/RecentActivityLog";
import { OnboardingTour } from "@/components/employee/OnboardingTour";
import { HelpTooltip } from "@/components/employee/HelpTooltip";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { getKPIData } = useAttendance();
  const { getLeaveBalance } = useLeave();
  const { activities } = useActivityLog();
  const {
    showTour,
    currentStep,
    currentTourStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
  } = useOnboardingTour();

  const leaveBalance = user ? getLeaveBalance(user.employeeId) : 20;
  const kpiData = user ? getKPIData(user.employeeId, leaveBalance) : {
    presentDays: 0,
    leaveBalance: 20,
    lateArrivals: 0,
    attendanceRate: 0,
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Only show tour for employees, not admins
  const showEmployeeTour = !isAdmin && showTour;

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding Tour - Employee Only */}
      {showEmployeeTour && currentTourStep && (
        <OnboardingTour
          show={showEmployeeTour}
          currentStep={currentTourStep}
          stepNumber={currentStep}
          totalSteps={totalSteps}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
        />
      )}

      {/* Header */}
      <header className="bg-card border-b border-border px-4 md:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">{currentDate}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xl md:text-2xl font-bold text-foreground">{currentTime}</p>
              <p className="text-xs text-muted-foreground">Current Time</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-muted hidden sm:flex items-center justify-center hover:bg-muted/80 transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Clock Card - Takes 1 column */}
          <div className="lg:col-span-1" id="quick-actions">
            <ClockCard />
          </div>

          {/* KPI Cards - Takes 2 columns */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3 md:gap-6" id="attendance-section">
            <KPICard
              title="Present Days"
              value={kpiData.presentDays}
              subtitle="This month"
              icon={CheckCircle2}
              iconColor="text-green-600"
              iconBgColor="bg-green-50"
              helpTooltip={!isAdmin ? "Number of days you were marked present this month." : undefined}
            />
            <KPICard
              title="Leave Balance"
              value={kpiData.leaveBalance}
              subtitle="Days available"
              icon={Calendar}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-50"
              helpTooltip={!isAdmin ? "Remaining leave days you can apply for this year." : undefined}
            />
            <KPICard
              title="Late Arrivals"
              value={kpiData.lateArrivals}
              subtitle="This month"
              icon={AlertCircle}
              iconColor="text-yellow-600"
              iconBgColor="bg-yellow-50"
              helpTooltip={!isAdmin ? "Days when you clocked in after 9:15 AM." : undefined}
            />
            <KPICard
              title="Attendance Rate"
              value={`${kpiData.attendanceRate}%`}
              subtitle="This month"
              icon={TrendingUp}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-50"
              helpTooltip={!isAdmin ? "Percentage of working days you were present." : undefined}
            />
          </div>
        </div>

        {/* Employee-only: Recent Activity Log */}
        {!isAdmin && (
          <div className="mb-6 md:mb-8">
            <RecentActivityLog activities={activities} />
          </div>
        )}

        {/* Profile Information */}
        <ProfileCard />
      </main>
    </div>
  );
};

export default Dashboard;
