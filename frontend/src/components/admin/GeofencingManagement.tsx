import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { apiService } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Geofencing {
  id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export const GeofencingManagement = ({ onClose }: { onClose: () => void }) => {
  const [locations, setLocations] = useState<Geofencing[]>([]);
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const data = await apiService.getGeofencing();
    setLocations(Array.isArray(data) ? data : []);
  };

  const handleAdd = async () => {
    if (!locationName || !latitude || !longitude || !radius) {
      toast({ title: "Error", description: "All fields required", variant: "destructive" });
      return;
    }
    try {
      await apiService.createGeofencing({
        location_name: locationName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius)
      });
      toast({ title: "Success", description: "Geofencing location added" });
      setLocationName("");
      setLatitude("");
      setLongitude("");
      setRadius("");
      fetchLocations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add location", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteGeofencing(id);
      toast({ title: "Success", description: "Location deleted" });
      fetchLocations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete location", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Location Name</Label>
        <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g., Main Office" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Latitude</Label>
          <Input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g., 40.7128" />
        </div>
        <div className="space-y-2">
          <Label>Longitude</Label>
          <Input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g., -74.0060" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Radius (meters)</Label>
        <Input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} placeholder="e.g., 100" />
      </div>
      <Button className="w-full" onClick={handleAdd}>Add Location</Button>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold mb-3">Configured Locations</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {locations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No locations configured</p>
          ) : (
            locations.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{location.location_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Lat: {location.latitude}, Lng: {location.longitude} • Radius: {location.radius}m
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(location.id)}>
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
