import { useAuth } from "@/contexts/AuthContext";

export const ProfileCard = () => {
  const { user } = useAuth();

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <h3 className="text-lg font-semibold text-card-foreground mb-6">Profile Information</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Employee ID</p>
          <p className="text-base font-medium text-card-foreground">{user?.employeeId || 'N/A'}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Department</p>
          <p className="text-base font-medium text-primary">{user?.department || 'N/A'}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Role</p>
          <p className="text-base font-medium text-card-foreground">{user?.role || 'N/A'}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Email</p>
          <p className="text-base font-medium text-card-foreground">{user?.email || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};
