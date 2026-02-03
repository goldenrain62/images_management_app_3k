"use client";
import React, { useState, useEffect } from "react";

interface DatePickerProps {
  defaultValue?: string; // Format: YYYY-MM-DD
  onChange?: (date: string) => void;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  defaultValue = "",
  onChange,
  className = "",
}) => {
  // Parse default value or use current date
  const parseDate = (dateString: string) => {
    if (dateString) {
      const [year, month, day] = dateString.split("-");
      return { day, month, year };
    }
    return { day: "", month: "", year: "" };
  };

  const { day: defaultDay, month: defaultMonth, year: defaultYear } = parseDate(defaultValue);

  const [day, setDay] = useState(defaultDay);
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);

  // Generate arrays for dropdowns
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const months = [
    { value: "01", label: "Tháng 1" },
    { value: "02", label: "Tháng 2" },
    { value: "03", label: "Tháng 3" },
    { value: "04", label: "Tháng 4" },
    { value: "05", label: "Tháng 5" },
    { value: "06", label: "Tháng 6" },
    { value: "07", label: "Tháng 7" },
    { value: "08", label: "Tháng 8" },
    { value: "09", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  // Update parent when date changes
  useEffect(() => {
    if (day && month && year && onChange) {
      const dateString = `${year}-${month}-${day}`;
      onChange(dateString);
    }
  }, [day, month, year, onChange]);

  const selectClassName = `h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 ${
    day && month && year
      ? "text-gray-800 dark:text-white/90 border-gray-300 dark:border-gray-700"
      : "text-gray-400 dark:text-gray-400 border-gray-300 dark:border-gray-700"
  }`;

  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      {/* Day Dropdown */}
      <select
        className={selectClassName}
        value={day}
        onChange={(e) => setDay(e.target.value)}
      >
        <option value="" disabled className="text-gray-400 dark:bg-gray-900">
          Ngày
        </option>
        {days.map((d) => (
          <option key={d} value={d} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {d}
          </option>
        ))}
      </select>

      {/* Month Dropdown */}
      <select
        className={selectClassName}
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      >
        <option value="" disabled className="text-gray-400 dark:bg-gray-900">
          Tháng
        </option>
        {months.map((m) => (
          <option key={m.value} value={m.value} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {m.label}
          </option>
        ))}
      </select>

      {/* Year Dropdown */}
      <select
        className={selectClassName}
        value={year}
        onChange={(e) => setYear(e.target.value)}
      >
        <option value="" disabled className="text-gray-400 dark:bg-gray-900">
          Năm
        </option>
        {years.map((y) => (
          <option key={y} value={y} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DatePicker;
