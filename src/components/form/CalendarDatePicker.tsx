"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface CalendarDatePickerProps {
  defaultValue?: string; // Format: YYYY-MM-DD
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
}

const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  defaultValue = "",
  onChange,
  placeholder = "Chọn ngày sinh",
  className = "",
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize currentMonth from defaultValue
  useEffect(() => {
    if (defaultValue) {
      try {
        // Handle both "YYYY-MM-DD" and timestamp formats
        const dateOnly = defaultValue.includes("T") ? defaultValue.split("T")[0] : defaultValue;
        const [year, month] = dateOnly.split("-");
        if (year && month) {
          setCurrentMonth(new Date(parseInt(year), parseInt(month) - 1));
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }
  }, [defaultValue]);

  // Format date for display (Vietnam format: dd/mm/yyyy)
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      // Handle both "YYYY-MM-DD" and timestamp formats
      const dateOnly = dateString.includes("T") ? dateString.split("T")[0] : dateString;
      const [year, month, day] = dateOnly.split("-");
      if (!year || !month || !day) return "";
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "";
    }
  };

  // Handle date selection
  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const dateString = `${year}-${month}-${dayStr}`;

    setSelectedDate(dateString);
    setIsOpen(false);

    if (onChange) {
      onChange(dateString);
    }
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Generate calendar days
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: (number | null)[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(null);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const days = getDaysInMonth();
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  // Check if a day is selected
  const isSelectedDay = (day: number | null) => {
    if (!day || !selectedDate) return false;
    const [year, month, dayStr] = selectedDate.split("-");
    return (
      parseInt(dayStr) === day &&
      parseInt(month) - 1 === currentMonth.getMonth() &&
      parseInt(year) === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          readOnly
          value={formatDisplayDate(selectedDate)}
          placeholder={placeholder}
          onClick={() => setIsOpen(!isOpen)}
          className={`h-11 w-full cursor-pointer rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:focus:border-brand-800 ${
            selectedDate
              ? "text-gray-800 dark:text-white/90 border-gray-300 dark:border-gray-700"
              : "text-gray-400 dark:text-gray-400 border-gray-300 dark:border-gray-700"
          } placeholder:text-gray-400 dark:placeholder:text-gray-400`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[280px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {/* Month/Year Header */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={previousMonth}
              className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => day && handleDateSelect(day)}
                disabled={!day}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                  !day
                    ? "cursor-default"
                    : isSelectedDay(day)
                    ? "bg-brand-500 text-white font-semibold"
                    : isToday(day)
                    ? "bg-gray-200 font-semibold text-gray-800 dark:bg-gray-700 dark:text-white/90"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDatePicker;
