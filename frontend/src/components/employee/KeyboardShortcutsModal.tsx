import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: "D", description: "Dashboard" },
  { key: "A", description: "Attendance" },
  { key: "L", description: "Apply Leave" },
  { key: "P", description: "Profile/Reports" },
  { key: "T", description: "Toggle Dark Mode" },
  { key: "I", description: "Clock In (Dashboard only)" },
  { key: "O", description: "Clock Out (Dashboard only)" },
  { key: "H", description: "Help" },
];

export const KeyboardShortcutsModal = ({ open, onClose }: KeyboardShortcutsModalProps) => {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="inline-flex items-center justify-center min-w-[2rem] h-8 px-3 text-sm font-semibold bg-background border border-border rounded-md shadow-sm text-foreground">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">ESC</kbd> to close
        </p>
      </DialogContent>
    </Dialog>
  );
};
