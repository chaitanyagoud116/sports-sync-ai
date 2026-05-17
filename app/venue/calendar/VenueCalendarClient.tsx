"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, isSameDay, parseISO,
} from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: "booking" | "maintenance";
  venue: string;
  status: string;
  sport: string | null;
}

function isInRange(date: Date, start: string, end: string) {
  const s = parseISO(start);
  const e = parseISO(end);
  return date >= s && date <= e;
}

export default function VenueCalendarClient({ events }: { events: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isInRange(day, e.startDate, e.endDate));

  const selectedEvents = selected ? getEventsForDay(selected) : [];

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 glass-card p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-primary text-lg">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="btn-secondary p-2">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-secondary text-xs px-3 py-2">
              Today
            </button>
            <button onClick={nextMonth} className="btn-secondary p-2">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="calendar-grid mb-2">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-xs font-medium py-2" style={{ color: "#475569" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Leading empty cells */}
        <div className="calendar-grid gap-1">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const hasBooking = dayEvents.some((e) => e.type === "booking");
            const hasMaintenance = dayEvents.some((e) => e.type === "maintenance");
            const isSelected = selected && isSameDay(day, selected);

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelected(isSameDay(day, selected || new Date(0)) ? null : day)}
                className="calendar-day cursor-pointer relative flex-col gap-1"
                style={{
                  background: isSelected
                    ? "rgba(37,99,235,0.3)"
                    : isToday(day)
                    ? "rgba(37,99,235,0.15)"
                    : "transparent",
                  color: isToday(day) ? "#60a5fa" : isSameMonth(day, currentDate) ? "#e2e8f0" : "#334155",
                  border: isSelected ? "1px solid rgba(59,130,246,0.5)" : "1px solid transparent",
                }}
              >
                <span className="text-sm font-medium">{format(day, "d")}</span>
                <div className="flex gap-0.5">
                  {hasBooking && (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#3b82f6" }} />
                  )}
                  {hasMaintenance && (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f59e0b" }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Panel */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-primary mb-4">
          {selected ? format(selected, "dd MMMM yyyy") : "Select a date"}
        </h3>

        {!selected && (
          <p className="text-sm" style={{ color: "#475569" }}>
            Click on a date to see events.
          </p>
        )}

        {selected && selectedEvents.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: "#475569" }}>No events on this date.</p>
          </div>
        )}

        <div className="space-y-3">
          {selectedEvents.map((e) => (
            <div key={e.id} className="p-4 rounded-xl"
              style={{
                background: e.type === "booking" ? "rgba(59,130,246,0.08)" : "rgba(251,191,36,0.08)",
                border: `1px solid ${e.type === "booking" ? "rgba(59,130,246,0.2)" : "rgba(251,191,36,0.2)"}`,
              }}>
              <div className="font-medium text-primary text-sm mb-1">{e.title}</div>
              <div className="text-xs" style={{ color: "#64748b" }}>
                <div>{e.venue}</div>
                {e.sport && <div>{e.sport.replace(/_/g, " ")}</div>}
                <div className="mt-1">
                  <span className={`badge ${e.status === "APPROVED" ? "badge-approved" : "badge-pending"}`}>
                    {e.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="text-xs font-medium text-primary mb-3">Legend</div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "#3b82f6" }} />
            Tournament / Booking
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
            Maintenance
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "#2563eb" }} />
            Today
          </div>
        </div>
      </div>
    </div>
  );
}
