import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { apiService } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Shift {
  id: string;
  shift_name: string;
  start_time: string;
  end_time: string;
}

export const ShiftManagement = ({ onClose }: { onClose: () => void }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftName, setShiftName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    const data = await apiService.getShifts();
    setShifts(Array.isArray(data) ? data : []);
  };

  const handleAdd = async () => {
    if (!shiftName || !startTime || !endTime) {
      toast({ title: "Error", description: "All fields required", variant: "destructive" });
      return;
    }
    try {
      await apiService.createShift({ shift_name: shiftName, start_time: startTime, end_time: endTime });
      toast({ title: "Success", description: "Shift added" });
      setShiftName("");
      setStartTime("");
      setEndTime("");
      fetchShifts();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add shift", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteShift(id);
      toast({ title: "Success", description: "Shift deleted" });
      fetchShifts();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete shift", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Shift Name</Label>
        <Input value={shiftName} onChange={(e) => setShiftName(e.target.value)} placeholder="e.g., Morning Shift" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>End Time</Label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>
      <Button className="w-full" onClick={handleAdd}>Add Shift</Button>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold mb-3">Existing Shifts</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {shifts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No shifts configured</p>
          ) : (
            shifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{shift.shift_name}</p>
                  <p className="text-sm text-muted-foreground">{shift.start_time} - {shift.end_time}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(shift.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
