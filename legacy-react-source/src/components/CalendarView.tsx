"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useStore } from "@/store/useStore";
import { ReminderCard } from "./ReminderCard";
import { Card } from "./ui/Card";
import { motion, AnimatePresence } from "framer-motion";

export function CalendarView() {
  const { reminders } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const modifierDates = reminders.map(r => new Date(r.dueDate));

  const modifiers = {
    hasReminder: modifierDates,
    hasOverdue: reminders
      .filter(r => !r.isCompleted && new Date(r.dueDate) < new Date() && !isSameDay(new Date(r.dueDate), new Date()))
      .map(r => new Date(r.dueDate))
  };

  const modifiersStyles = {
    hasReminder: { fontWeight: 'bold' as const, color: '#6366f1' },
    hasOverdue: { color: '#ef4444' }
  };

  const remindersForDate = selectedDate
    ? reminders.filter(r => isSameDay(new Date(r.dueDate), selectedDate))
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 flex justify-center items-start shadow-sm border-gray-100 h-fit bg-white border">
        <style>{`
          .rdp { --rdp-accent-color: #6366f1; margin: 0; --rdp-background-color: #eewcf5; }
        `}</style>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
        />
      </Card>
      
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-lg mb-2 pl-1">
          {selectedDate ? format(selectedDate, "EEEE, MMM do") : "Select a date"}
        </h3>
        <AnimatePresence mode="popLayout">
          {remindersForDate.length > 0 ? (
            remindersForDate.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 backdrop-blur-sm"
            >
              <div className="text-3xl mb-2">🌴</div>
              <h3 className="font-medium text-gray-900">No scheduled tasks</h3>
              <p className="text-xs mt-1">Free day!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
