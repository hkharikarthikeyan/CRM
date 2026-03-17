import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AttendanceProvider } from "@/contexts/AttendanceContext";
import { LeaveProvider } from "@/contexts/LeaveContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { EmployeeShortcutsProvider } from "@/components/employee/EmployeeShortcutsProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/LeavesNew";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import AdminEmployees from "./pages/AdminEmployees";
import AdminLeaveRequests from "./pages/AdminLeaveRequestsNew";
import AdminAttendanceCorrections from "./pages/AdminAttendanceCorrections";
import AdminReports from "./pages/AdminReports";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AttendanceProvider>
          <LeaveProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Employee Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <EmployeeShortcutsProvider>
                        <AppLayout>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/attendance" element={<Attendance />} />
                            <Route path="/leaves" element={<Leaves />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </AppLayout>
                      </EmployeeShortcutsProvider>
                    </ProtectedRoute>
                  }
                />
                
                {/* Protected Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute adminOnly>
                      <AppLayout>
                        <Routes>
                          <Route path="/" element={<Admin />} />
                          <Route path="/employees" element={<AdminEmployees />} />
                          <Route path="/attendance" element={<Admin />} />
                          <Route path="/leaves" element={<AdminLeaveRequests />} />
                          <Route path="/corrections" element={<AdminAttendanceCorrections />} />
                          <Route path="/reports" element={<AdminReports />} />
                          <Route path="/panel" element={<AdminPanel />} />
                          <Route path="/settings" element={<Admin />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </LeaveProvider>
        </AttendanceProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
