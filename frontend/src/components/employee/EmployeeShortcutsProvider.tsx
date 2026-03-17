import { useState, useCallback } from "react";
import { useEmployeeKeyboardShortcuts } from "@/hooks/useEmployeeKeyboardShortcuts";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";

interface EmployeeShortcutsProviderProps {
  children: React.ReactNode;
}

export const EmployeeShortcutsProvider = ({ children }: EmployeeShortcutsProviderProps) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleOpenHelp = useCallback(() => {
    setIsHelpOpen(true);
  }, []);

  const handleCloseHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  useEmployeeKeyboardShortcuts({ onOpenHelp: handleOpenHelp });

  return (
    <>
      {children}
      <KeyboardShortcutsModal open={isHelpOpen} onClose={handleCloseHelp} />
    </>
  );
};
