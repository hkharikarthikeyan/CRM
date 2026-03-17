import React, { createContext, useContext, useState, useEffect } from "react";
import { currentUser, employees } from "@/lib/mockData";

type UserRole = "admin" | "employee";

interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  role: string;
  userRole: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (employeeId: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (employeeId: string, password: string, role: UserRole): Promise<boolean> => {
    // Login via backend API for both admin and employee
    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: employeeId,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("auth_token", data.access_token);
        
        if (role === "admin") {
          const adminData = {
            id: "admin-001",
            name: "Admin User",
            email: "admin@company.com",
            employeeId: employeeId,
            department: "Administration",
            role: "System Administrator",
            userRole: "admin" as UserRole
          };
          setUser(adminData);
          setIsAuthenticated(true);
          localStorage.setItem("auth_user", JSON.stringify(adminData));
          return true;
        } else {
          // Get employee details from backend
          const userResponse = await fetch("http://localhost:8000/auth/me", {
            headers: {
              "Authorization": `Bearer ${data.access_token}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const employeeData = {
              id: employeeId,
              name: userData.name,
              email: userData.email || "",
              employeeId: employeeId,
              department: "Employee",
              role: userData.role || "Employee",
              userRole: "employee" as UserRole
            };
            setUser(employeeData);
            setIsAuthenticated(true);
            localStorage.setItem("auth_user", JSON.stringify(employeeData));
            return true;
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  const isAdmin = user?.userRole === "admin";

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
