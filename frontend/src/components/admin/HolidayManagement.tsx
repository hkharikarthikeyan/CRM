import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { apiService } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Holiday {
  id: string;
  holiday_name: string;
  holiday_date: string;
}

export const HolidayManagement = ({ onClose }: { onClose: () => void }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    const data = await apiService.getHolidays();
    setHolidays(Array.isArray(data) ? data : []);
  };

  const handleAdd = async () => {
    if (!holidayName || !holidayDate) {
      toast({ title: "Error", description: "All fields required", variant: "destructive" });
      return;
    }
    try {
      await apiService.createHoliday({ holiday_name: holidayName, holiday_date: holidayDate });
      toast({ title: "Success", description: "Holiday added" });
      setHolidayName("");
      setHolidayDate("");
      fetchHolidays();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add holiday", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteHoliday(id);
      toast({ title: "Success", description: "Holiday deleted" });
      fetchHolidays();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete holiday", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Holiday Name</Label>
        <Input value={holidayName} onChange={(e) => setHolidayName(e.target.value)} placeholder="e.g., Diwali" />
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} />
      </div>
      <Button className="w-full" onClick={handleAdd}>Add Holiday</Button>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold mb-3">Existing Holidays</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {holidays.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No holidays configured</p>
          ) : (
            holidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{holiday.holiday_name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(holiday.holiday_date).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(holiday.id)}>
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
