// Mock data for the Employee Attendance Management System

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  contact: string;
  status: "present" | "absent" | "late" | "on-leave";
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  day?: string;
  clockIn: string;
  clockOut?: string;
  status: "present" | "absent" | "late" | "half-day";
  location?: string;
  ipAddress?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "sick" | "casual" | "earned" | "vacation" | "personal" | "unpaid";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: string;
  days?: number;
}

export interface KPIData {
  presentDays: number;
  leaveBalance: number;
  lateArrivals: number;
  attendanceRate: number;
}

// Current user (mock)
export const currentUser: Employee = {
  id: "emp-001",
  employeeId: "EMP001",
  name: "Rajesh Kumar",
  email: "rajesh@company.com",
  department: "Engineering",
  role: "Senior Developer",
  contact: "+91 98765 43210",
  status: "present",
};

// Sample employees
export const employees: Employee[] = [
  currentUser,
  {
    id: "emp-002",
    employeeId: "EMP002",
    name: "Priya Sharma",
    email: "priya@company.com",
    department: "HR",
    role: "HR Manager",
    contact: "+91 98765 43211",
    status: "present",
  },
  {
    id: "emp-003",
    employeeId: "EMP003",
    name: "Amit Singh",
    email: "amit@company.com",
    department: "Sales",
    role: "Sales Executive",
    contact: "+91 98765 43212",
    status: "late",
  },
  {
    id: "emp-004",
    employeeId: "EMP004",
    name: "Sneha Patel",
    email: "sneha@company.com",
    department: "Marketing",
    role: "Marketing Lead",
    contact: "+91 98765 43213",
    status: "on-leave",
  },
  {
    id: "emp-005",
    employeeId: "EMP005",
    name: "Vikram Reddy",
    email: "vikram@company.com",
    department: "Engineering",
    role: "Junior Developer",
    contact: "+91 98765 43214",
    status: "absent",
  },
];

// Sample attendance records
export const attendanceRecords: AttendanceRecord[] = [
  {
    id: "ATT001",
    employeeId: "EMP001",
    date: "2025-11-25",
    clockIn: "09:15 AM",
    clockOut: "06:30 PM",
    status: "present",
    location: "Office",
    ipAddress: "192.168.1.100",
  },
  {
    id: "ATT002",
    employeeId: "EMP001",
    date: "2025-11-24",
    clockIn: "09:05 AM",
    clockOut: "06:15 PM",
    status: "present",
    location: "Office",
  },
  {
    id: "ATT003",
    employeeId: "EMP001",
    date: "2025-11-23",
    clockIn: "09:30 AM",
    clockOut: "06:00 PM",
    status: "late",
    location: "Office",
  },
  {
    id: "ATT004",
    employeeId: "EMP001",
    date: "2025-11-22",
    clockIn: "09:00 AM",
    clockOut: "06:00 PM",
    status: "present",
    location: "Remote",
  },
];

// Sample leave requests
export const leaveRequests: LeaveRequest[] = [
  {
    id: "LV001",
    employeeId: "EMP004",
    type: "sick",
    startDate: "2025-10-29",
    endDate: "2025-10-30",
    reason: "Medical checkup",
    status: "approved",
    appliedOn: "2025-10-25",
    days: 2,
  },
  {
    id: "LV002",
    employeeId: "EMP001",
    type: "casual",
    startDate: "2025-11-05",
    endDate: "2025-11-07",
    reason: "Personal work",
    status: "pending",
    appliedOn: "2025-11-01",
    days: 3,
  },
  {
    id: "LV003",
    employeeId: "EMP003",
    type: "earned",
    startDate: "2025-11-15",
    endDate: "2025-11-20",
    reason: "Family vacation",
    status: "pending",
    appliedOn: "2025-11-10",
    days: 6,
  },
];

// KPI data for current month
export const kpiData: KPIData = {
  presentDays: 18,
  leaveBalance: 12,
  lateArrivals: 2,
  attendanceRate: 82,
};

// Export functions
export const getEmployeeById = (id: string) => employees.find((emp) => emp.id === id);
export const getAttendanceByEmployee = (employeeId: string) =>
  attendanceRecords.filter((record) => record.employeeId === employeeId);
export const getLeavesByEmployee = (employeeId: string) =>
  leaveRequests.filter((leave) => leave.employeeId === employeeId);
