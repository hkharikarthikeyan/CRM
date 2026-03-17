import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";

export const ClockCard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth();
  const { addClockIn, addClockOut, getTodayRecord, refreshRecords } = useAttendance();

  const todayRecord = user ? getTodayRecord(user.employeeId) : undefined;
  const isClockedIn = !!todayRecord && !todayRecord.clockOut;
  const isClockedOut = !!todayRecord?.clockOut;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const handleClockAction = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to clock in/out",
        variant: "destructive",
      });
      return;
    }

    if (!isClockedIn && !isClockedOut) {
      // Clock In - Check geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Fetch geofencing locations
            try {
              const response = await fetch('http://localhost:8000/geofencing');
              const locations = await response.json();

              if (locations.length === 0) {
                // No geofencing configured, allow clock-in
                const record = addClockIn(user.employeeId);
                toast({
                  title: "Clocked In Successfully",
                  description: `You clocked in at ${record.clockIn}`,
                });
                refreshRecords();
                return;
              }

              // Check if within any geofence
              const isWithinGeofence = locations.some((loc: any) => {
                const distance = calculateDistance(userLat, userLng, loc.latitude, loc.longitude);
                return distance <= loc.radius;
              });

              if (isWithinGeofence) {
                const record = addClockIn(user.employeeId);
                toast({
                  title: "Clocked In Successfully",
                  description: `You clocked in at ${record.clockIn}`,
                });
                refreshRecords();
              } else {
                toast({
                  title: "Location Error",
                  description: "You are outside the allowed location. Please clock in from office.",
                  variant: "destructive",
                });
              }
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to verify location",
                variant: "destructive",
              });
            }
          },
          (error) => {
            toast({
              title: "Location Access Denied",
              description: "Please enable location access to clock in.",
              variant: "destructive",
            });
          }
        );
      } else {
        toast({
          title: "Location Not Supported",
          description: "Your browser doesn't support geolocation.",
          variant: "destructive",
        });
      }
    } else if (isClockedIn && !isClockedOut) {
      // Clock Out
      addClockOut(user.employeeId);
      toast({
        title: "Clocked Out Successfully",
        description: `You clocked out at ${formatTime(currentTime)}`,
      });
      refreshRecords();
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const getButtonText = () => {
    if (isClockedOut) return "Completed for Today";
    if (isClockedIn) return "Clock Out";
    return "Clock In";
  };

  return (
    <div className="bg-gradient-primary rounded-2xl p-8 text-white shadow-lg">
      <div className="flex flex-col items-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
          <Clock className="h-10 w-10" />
        </div>
        
        <div className="text-center">
          <p className="text-5xl font-bold mb-2">{formatTime(currentTime)}</p>
          <p className="text-xl opacity-90">{formatDay(currentTime)}</p>
        </div>

        <Button
          onClick={handleClockAction}
          disabled={isClockedOut}
          size="lg"
          className="w-full max-w-xs bg-white text-primary hover:bg-white/90 font-semibold py-6 text-lg rounded-xl shadow-md disabled:opacity-50"
        >
          <Clock className="mr-2 h-5 w-5" />
          {getButtonText()}
        </Button>

        {todayRecord && (
          <div className="text-center text-sm opacity-80">
            <p>Clock In: {todayRecord.clockIn}</p>
            {todayRecord.clockOut && <p>Clock Out: {todayRecord.clockOut}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
