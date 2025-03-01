"use client";
import React from "react";
import dynamic from "next/dynamic";
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
import { Button } from "@/components/ui/button";

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
    <div className="">
      <div className="flex gap-4 flex-col mb-6">
        <Card className="">
          <CardHeader>
            <CardTitle>Suggested days to calibrate tools</CardTitle>
            <CardDescription>
              Based on previous calibration data
            </CardDescription>
          </CardHeader>
          <ScrollArea>
            <CardContent className="gap-4 flex flex-col">
              {mockData.map((data: data, index) => (
                <React.Fragment key={index}>{listCard(data)}</React.Fragment>
              ))}
            </CardContent>
          </ScrollArea>
          {/* <CardFooter>
            <p>Card Footer</p>
          </CardFooter> */}
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

const riskColors: any = {
  1: "bg-green-500 text-white", // Low risk
  2: "bg-yellow-500 text-black", // Medium risk
  3: "bg-red-500 text-white", // High risk
};

const listCard = (data: data) => {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-md space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg">{data.tooldesc}</p>
          <p className="text-sm text-gray-500">
            ID: {data.id} | Model: {data.model}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            riskColors[data.risk]
          }`}
        >
          Risk Level {data.risk}
        </div>
      </div>

      <div className="text-sm text-gray-700 space-y-1">
        <p>
          <span className="font-medium">Calibration Date:</span>{" "}
          {data.calibrationDate.toLocaleDateString()}
        </p>
        <div>
          <span className="font-medium">Recommended Calibration Date:</span>{" "}
          {data.recDate.toLocaleDateString()}
          <div className="flex justify-end gap-3">
            <Button>Accept</Button>
            <Button variant={"destructive"}>Decline</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
