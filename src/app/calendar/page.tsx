"use client";
import React from "react";
import dynamic from "next/dynamic";
import { CalendarDatePicker } from "@/components/calendar";
import { DateRange } from "react-day-picker";
import { CalendarEvent, Mode } from "@/components/calendar/calendar-types";
import { generateMockEvents } from "@/lib/mock";

// Dynamically import the Calendar component with SSR disabled
const Calendar = dynamic(() => import("@/components/calendar/calendar"), {
  ssr: false,
});

const CalendarPage = () => {
  const [events, setEvents] = React.useState<CalendarEvent[]>(
    generateMockEvents()
  );
  const [mode, setMode] = React.useState<Mode>("month");
  const [date, setDate] = React.useState<Date>(new Date());

  return (
    <Calendar
      events={events}
      setEvents={setEvents}
      mode={mode}
      setMode={setMode}
      date={date}
      setDate={setDate}
    />
  );
};

export default CalendarPage;
