import { useState, useEffect } from "react";
import { Bell, Users, Clock, Calendar, MapPin, Settings, Bell as NotificationIcon, Database, Shield, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAttendance } from "@/contexts/AttendanceContext";
import { useLeave } from "@/contexts/LeaveContext";
import { apiService } from "@/lib/supabase";
import { ShiftManagement } from "@/components/admin/ShiftManagement";
import { HolidayManagement } from "@/components/admin/HolidayManagement";
import { GeofencingManagement } from "@/components/admin/GeofencingManagement";

const AdminPanel = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const { toast } = useToast();
  const { records } = useAttendance();
  const { leaveRequests } = useLeave();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await apiService.getEmployees();
        setTotalEmployees(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  const todayRecords = records.filter(r => r.date === new Date().toISOString().split('T')[0]);
  const presentToday = todayRecords.length;
  const lateToday = todayRecords.filter(r => r.status === 'late').length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSubmit = (formName: string) => {
    toast({
      title: "Success",
      description: `${formName} saved successfully.`,
    });
    setActiveDialog(null);
  };

  const SettingItem = ({ icon: Icon, label, dialogKey }: { icon: React.ElementType; label: string; dialogKey: string }) => (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground hover:bg-muted"
      onClick={() => setActiveDialog(dialogKey)}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Button>
  );

  return (
    <div className="flex-1 p-4 md:p-8 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">{formatDate(currentTime)}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl md:text-2xl font-semibold text-foreground">{formatTime(currentTime)}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Current Time</p>
          </div>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{presentToday}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
                <p className="text-2xl font-bold text-yellow-600">{lateToday}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Leaves</p>
                <p className="text-2xl font-bold text-orange-600">{pendingLeaves}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Employee Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingItem icon={Users} label="Add New Employee" dialogKey="addEmployee" />
            <SettingItem icon={Users} label="Edit Employee Details" dialogKey="editEmployee" />
            <SettingItem icon={Settings} label="Manage Departments" dialogKey="manageDepartments" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Shift & Holiday Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingItem icon={Clock} label="Configure Shifts" dialogKey="configureShifts" />
            <SettingItem icon={Calendar} label="Manage Holidays" dialogKey="manageHolidays" />
            <SettingItem icon={Settings} label="Working Hours Settings" dialogKey="workingHours" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Geo-location & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingItem icon={MapPin} label="Configure Geo-fencing" dialogKey="geoFencing" />
            <SettingItem icon={Shield} label="IP Whitelist Settings" dialogKey="ipWhitelist" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Integrations (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingItem icon={Settings} label="Payroll System Integration" dialogKey="payrollIntegration" />
            <SettingItem icon={Settings} label="Biometric Device Setup" dialogKey="biometricSetup" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            <SettingItem icon={Settings} label="General Settings" dialogKey="generalSettings" />
            <SettingItem icon={NotificationIcon} label="Notification Settings" dialogKey="notificationSettings" />
            <SettingItem icon={Users} label="User Roles & Permissions" dialogKey="userRoles" />
            <SettingItem icon={Database} label="Data Backup & Export" dialogKey="dataBackup" />
          </div>
        </CardContent>
      </Card>

      {/* Add New Employee Dialog */}
      <Dialog open={activeDialog === "addEmployee"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Enter employee name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="Enter role" />
            </div>
            <Button className="w-full" onClick={() => handleSubmit("Employee")}>Add Employee</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={activeDialog === "editEmployee"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="selectEmployee">Select Employee</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emp1">Rajesh Kumar</SelectItem>
                  <SelectItem value="emp2">Priya Sharma</SelectItem>
                  <SelectItem value="emp3">Amit Singh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editName">Full Name</Label>
              <Input id="editName" placeholder="Enter employee name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input id="editEmail" type="email" placeholder="email@company.com" />
            </div>
            <Button className="w-full" onClick={() => handleSubmit("Employee details")}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Departments Dialog */}
      <Dialog open={activeDialog === "manageDepartments"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Departments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="newDept">Add New Department</Label>
              <Input id="newDept" placeholder="Enter department name" />
            </div>
            <Button className="w-full" onClick={() => handleSubmit("Department")}>Add Department</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure Shifts Dialog */}
      <Dialog open={activeDialog === "configureShifts"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Shifts</DialogTitle>
          </DialogHeader>
          <ShiftManagement onClose={() => setActiveDialog(null)} />
        </DialogContent>
      </Dialog>

      {/* Manage Holidays Dialog */}
      <Dialog open={activeDialog === "manageHolidays"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Holidays</DialogTitle>
          </DialogHeader>
          <HolidayManagement onClose={() => setActiveDialog(null)} />
        </DialogContent>
      </Dialog>

      {/* Working Hours Settings Dialog */}
      <Dialog open={activeDialog === "workingHours"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Working Hours Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workStart">Work Start Time</Label>
                <Input id="workStart" type="time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workEnd">Work End Time</Label>
                <Input id="workEnd" type="time" defaultValue="18:00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lateThreshold">Late Threshold (minutes)</Label>
              <Input id="lateThreshold" type="number" defaultValue="15" />
            </div>
            <Button className="w-full" onClick={() => handleSubmit("Working hours")}>Save Settings</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Geo-fencing Dialog */}
      <Dialog open={activeDialog === "geoFencing"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Geo-fencing</DialogTitle>
          </DialogHeader>
          <GeofencingManagement onClose={() => setActiveDialog(null)} />
        </DialogContent>
      </Dialog>

      {/* IP Whitelist Dialog */}
      <Dialog open={activeDialog === "ipWhitelist"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>IP Whitelist Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input id="ipAddress" placeholder="e.g., 192.168.1.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ipDescription">Description</Label>
              <Input id="ipDescription" placeholder="e.g., Office Network" />
            </div>
            <Button className="w-full" onClick={() => handleSubmit("IP Whitelist")}>Add IP Address</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* General Settings Dialog */}
      <Dialog open={activeDialog === "generalSettings"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>General Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Enter company name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                  <SelectItem value="pst">PST (UTC-8)</SelectItem>
                  <SelectItem value="est">EST (UTC-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => handleSubmit("General settings")}>Save Settings</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog open={activeDialog === "notificationSettings"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="emailNotif">Email Notifications</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="important">Important Only</SelectItem>
                  <SelectItem value="none">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => handleSubmit("Notification settings")}>Save Settings</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Roles Dialog */}
      <Dialog open={activeDialog === "userRoles"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Roles & Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input id="roleName" placeholder="e.g., Manager" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permissions">Permissions</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select permissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Full Access</SelectItem>
                  <SelectItem value="manager">Manager Access</SelectItem>
                  <SelectItem value="employee">Employee Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => handleSubmit("Role")}>Add Role</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Backup Dialog */}
      <Dialog open={activeDialog === "dataBackup"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Data Backup & Export</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => handleSubmit("Data export")}>Export Data</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payroll Integration Dialog */}
      <Dialog open={activeDialog === "payrollIntegration"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payroll System Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="payrollApi">API Endpoint</Label>
              <Input id="payrollApi" placeholder="https://api.payroll.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payrollKey">API Key</Label>
              <Input id="payrollKey" type="password" placeholder="Enter API key" />
            </div>
            <Button className="w-full" onClick={() => handleSubmit("Payroll integration")}>Connect</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Biometric Setup Dialog */}
      <Dialog open={activeDialog === "biometricSetup"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Biometric Device Setup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name</Label>
              <Input id="deviceName" placeholder="e.g., Main Entrance" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceIp">Device IP Address</Label>
              <Input id="deviceIp" placeholder="192.168.1.100" />
            </div>
            <Button className="w-full" onClick={() => handleSubmit("Biometric device")}>Add Device</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
