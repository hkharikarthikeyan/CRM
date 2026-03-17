// Holiday list for smart leave suggestions
export interface Holiday {
  date: string; // YYYY-MM-DD format
  name: string;
}

export const holidays: Holiday[] = [
  { date: "2024-01-01", name: "New Year's Day" },
  { date: "2024-01-26", name: "Republic Day" },
  { date: "2024-03-25", name: "Holi" },
  { date: "2024-03-29", name: "Good Friday" },
  { date: "2024-04-14", name: "Ambedkar Jayanti" },
  { date: "2024-04-17", name: "Ram Navami" },
  { date: "2024-05-01", name: "May Day" },
  { date: "2024-08-15", name: "Independence Day" },
  { date: "2024-10-02", name: "Gandhi Jayanti" },
  { date: "2024-10-12", name: "Dussehra" },
  { date: "2024-11-01", name: "Diwali" },
  { date: "2024-11-15", name: "Guru Nanak Jayanti" },
  { date: "2024-12-25", name: "Christmas" },
  { date: "2025-01-01", name: "New Year's Day" },
  { date: "2025-01-26", name: "Republic Day" },
  { date: "2025-03-14", name: "Holi" },
  { date: "2025-04-18", name: "Good Friday" },
  { date: "2025-04-14", name: "Ambedkar Jayanti" },
  { date: "2025-05-01", name: "May Day" },
  { date: "2025-08-15", name: "Independence Day" },
  { date: "2025-10-02", name: "Gandhi Jayanti" },
  { date: "2025-10-20", name: "Diwali" },
  { date: "2025-12-25", name: "Christmas" },
];

export const getHolidayName = (dateStr: string): string | null => {
  const holiday = holidays.find((h) => h.date === dateStr);
  return holiday ? holiday.name : null;
};

export const isSunday = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date.getDay() === 0;
};

export const isSaturday = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date.getDay() === 6;
};
