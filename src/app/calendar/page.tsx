"use client";
import React from "react";
import dynamic from "next/dynamic";
// import { CalendarDatePicker } from "@/components/calendar";
// import { DateRange } from "react-day-picker";
import { CalendarEvent, Mode } from "@/components/calendar/calendar-types";
import { generateMockEvents } from "@/lib/mock";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type data = {
  id: number;
  tooldesc: string;
  model: string;
  risk: number;
  calibrationDate: Date;
  recDate: Date;
};

const mockData: data[] = [
  {
    id: 264988,
    tooldesc: "Blade Micrometer",
    model: "691-101A",
    risk: 3,
    calibrationDate: new Date("2026-10-12"),
    recDate: new Date("2026-7-8"),
  },
  {
    id: 267754,
    tooldesc: "Dial Test Indicator",
    model: "691-101A",
    risk: 3,
    calibrationDate: new Date("2026-10-12"),
    recDate: new Date("2026-7-8"),
  },
  {
    id: 126881,
    tooldesc: "Digimatic Caliper",
    model: "691-101A",
    risk: 3,
    calibrationDate: new Date("2026-10-12"),
    recDate: new Date("2026-7-8"),
  },
  {
    id: 2050302,
    tooldesc: "Digital Caliper",
    model: "691-101A",
    risk: 3,
    calibrationDate: new Date("2026-10-12"),
    recDate: new Date("2026-7-8"),
  },
  {
    id: 267754,
    tooldesc: "Micrometer Digital",
    model: "691-101A",
    risk: 3,
    calibrationDate: new Date("2026-10-12"),
    recDate: new Date("2026-7-8"),
  },
];

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
    <div>
      <div className="flex gap-2 flex-row">
        <Card className="">
          <CardHeader>
            <CardTitle>Suggested days to calibrate tools</CardTitle>
            <CardDescription>
              Based on previous calibration data
            </CardDescription>
          </CardHeader>
          <ScrollArea className="rounded-md border">
            <CardContent>
              {mockData.map((data: data, index) => (
                <React.Fragment key={index}>{listCard(data)}</React.Fragment>
              ))}
            </CardContent>
          </ScrollArea>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Calibration dates</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Calendar
          events={events}
          setEvents={setEvents}
          mode={mode}
          setMode={setMode}
          date={date}
          setDate={setDate}
        />
      </div>
    </div>
  );
};

const listCard = (data: data) => {
  return (
    <Card className="w-full h-16 my-2 p-2">
      <div className="flex gap-4">
        <p>
          Tool: {data.tooldesc} ID: {data.id} Model: {data.model}
        </p>
        <p>Calibration Date: {data.calibrationDate.toLocaleDateString()}</p>
        <p>
          Recommended Calibration Date: {data.recDate.toLocaleDateString()} |
          Risk Level: {data.risk}
        </p>
      </div>
    </Card>
  );
};

export default CalendarPage;
