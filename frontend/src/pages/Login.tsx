import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserRole = "employee" | "admin";

const Login = () => {
  const [role, setRole] = useState<UserRole>("employee");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(employeeId, password, role);
      if (success) {
        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });
        navigate(role === "admin" ? "/admin" : "/");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Employee Attendance System
          </h1>
          <p className="text-primary-foreground/80">Sign in to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-center text-foreground mb-6">
            Login
          </h2>

          {/* Role Toggle */}
          <div className="flex bg-muted rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole("employee")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                role === "employee"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              Employee
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                role === "admin"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="EMP001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            {/* Demo Credentials */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium text-foreground mb-2">Login as {role}:</p>
              <p className="text-muted-foreground">
                Enter your credentials to continue
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : `Sign In as ${role === "employee" ? "Employee" : "Admin"}`}
            </Button>
          </form>

          {/* Note */}
          <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
            <p>
              <strong className="text-blue-900">Note:</strong> This is a demo system. In production, 
              authentication should be handled by a secure backend service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
