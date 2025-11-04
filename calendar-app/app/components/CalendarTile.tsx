// components/CalendarTile.tsx (Client Component)
"use client";
import { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, isWithinInterval } from "date-fns";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO string with timezone offset
  end: string;   // ISO string with timezone offset
};

// API response shape expected from /api/events?month=YYYY-MM
// You will implement the endpoint; this client expects:
// { events: CalendarEvent[] }
export type EventsApiResponse = { events: CalendarEvent[] };

function buildMonthMatrix(year: number, monthIndex: number) {
  const start = startOfWeek(startOfMonth(new Date(year, monthIndex, 1)));
  const end = endOfWeek(endOfMonth(new Date(year, monthIndex, 1)));
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  // chunk by 7
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

function eventSpansDay(evt: CalendarEvent, day: Date) {
  const s = parseISO(evt.start);
  const e = parseISO(evt.end);
  const startOfDay = new Date(day); startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(day); endOfDay.setHours(23,59,59,999);
  return isWithinInterval(s, { start: startOfDay, end: endOfDay }) ||
         isWithinInterval(e, { start: startOfDay, end: endOfDay }) ||
         (s < startOfDay && e > endOfDay); // spans across this day
}

export default function CalendarShell({ initialMonth }: { initialMonth: string }) {
  const [cursor, setCursor] = useState(() => {
    const [y, m] = initialMonth.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, 1);
  });

  const matrix = useMemo(() => buildMonthMatrix(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  // Fetch events for the visible month from /api/events on the client
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(monthStr: string) {
    try {
      setLoading(true);
      setError(null);
      setEvents(null);
      const res = await fetch(`/api/events?month=${encodeURIComponent(monthStr)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load events: ${res.status}`);
      const data: EventsApiResponse = await res.json();
      setEvents(data.events ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useMemo(() => { load(format(cursor, "yyyy-MM")); /* eslint-disable-line */ }, []);

  useEffect(() => {
  load(format(cursor, "yyyy-MM"));
    }, [cursor]);

const onNext = () => setCursor(addMonths(cursor, 1));
const onPrev = () => setCursor(addMonths(cursor, -1));

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrev} className="px-3 py-1 rounded-2xl border shadow-sm">← Prev</button>
        <div className="text-xl font-semibold">{format(cursor, "MMMM yyyy")}</div>
        <button onClick={onNext} className="px-3 py-1 rounded-2xl border shadow-sm">Next →</button>
      </div>

      <div className="grid grid-cols-7 text-sm font-medium text-gray-600 mb-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="px-2 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 gap-px bg-gray-200 rounded-xl overflow-hidden">
        {loading && (
          <div className="col-span-7 p-6 text-sm text-gray-600">Loading events…</div>
        )}
        {error && (
          <div className="col-span-7 p-6 text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && matrix.flat().map((day, idx) => {
          const inMonth = isSameMonth(day, cursor);
          const dayEvents = (events ?? []).filter(e => eventSpansDay(e, day));
          const isToday = isSameDay(day, new Date());
          return (
            <div key={idx} className={`bg-white p-2 min-h-[110px] flex flex-col ${!inMonth ? "opacity-40" : ""}`}>
              <div className="flex items-center justify-between">
                <div className={`text-xs ${isToday ? "px-2 py-0.5 rounded-full bg-black text-white" : "text-gray-700"}`}>
                  {format(day, "d")}
                </div>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-gray-500">{dayEvents.length} event{dayEvents.length>1?"s":""}</span>
                )}
              </div>
              <div className="mt-2 space-y-1">
                {dayEvents.slice(0,3).map(evt => (
                  <div key={evt.id} className="truncate text-xs px-2 py-1 rounded-md border">
                    {format(parseISO(evt.start), "HH:mm")} · {evt.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-gray-500">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Notes
// - Uses date-fns for robust date math.
// - Events include ISO datetimes; eventSpansDay handles multi-day spans.
// - Replace getEvents() with a real DB call or fetch to /api/events.
// - Tailwind classes are used for quick styling; remove if not using Tailwind.
