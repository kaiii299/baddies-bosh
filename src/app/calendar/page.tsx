"use client";
import React from "react";
import dynamic from "next/dynamic";
import { CalendarEvent, Mode } from "@/components/calendar/calendar-types";
import { generateMockEvents } from "@/lib/mock";
import {
  Card,
  CardContent,
  CardDescription,
  //   CardFooter,
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
    risk: 1,
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
    risk: 2,
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
  const [acceptedTools, setAcceptedTools] = React.useState<number[]>([]);

  // Function to add a calibration event to the calendar
  const addCalibrationEvent = (tool: data) => {
    // Create a new event object
    const newEvent: CalendarEvent = {
      id: `tool-${tool.id}-${Date.now()}`, // Create a unique ID
      title: `Calibrate: ${tool.tooldesc}`,
      color: getRiskColor(tool.risk),
      start: new Date(tool.recDate),
      end: new Date(
        new Date(tool.recDate).setHours(new Date(tool.recDate).getHours() + 1)
      ), // 1 hour duration
      description: `Tool ID: ${tool.id}, Model: ${tool.model}, Risk Level: ${tool.risk}`,
    };

    // Add the new event to the events array
    setEvents((prevEvents) => [...prevEvents, newEvent]);

    // Mark this tool as accepted
    setAcceptedTools((prev) => [...prev, tool.id]);

    // Set the calendar date to the recommended calibration date
    setDate(new Date(tool.recDate));
  };

  // Helper function to map risk level to color
  const getRiskColor = (risk: number): string => {
    switch (risk) {
      case 1:
        return "green";
      case 2:
        return "yellow";
      case 3:
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <div className="">
      <div className="flex gap-4 flex-col mb-6">
        <Card className="h-[500px] overflow-hidden">
          <CardHeader>
            <CardTitle>Suggested days to calibrate tools</CardTitle>
            <CardDescription>
              Based on previous calibration data
            </CardDescription>
          </CardHeader>
          <ScrollArea className="w-full h-full pb-20">
            <CardContent className="gap-4 flex flex-col">
              {mockData.map((data: data, index) => (
                <React.Fragment key={index}>
                  {listCard(
                    data,
                    addCalibrationEvent,
                    acceptedTools.includes(data.id)
                  )}
                </React.Fragment>
              ))}
            </CardContent>
          </ScrollArea>
          {/* <CardFooter>
            <p>Card Footer</p>
          </CardFooter> */}
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

const riskColors: Record<number, string> = {
  1: "bg-green-500 text-white", // Low risk
  2: "bg-yellow-500 text-black", // Medium risk
  3: "bg-red-500 text-white", // High risk
};

const listCard = (
  data: data,
  onAccept: (data: data) => void,
  isAccepted: boolean
) => {
  // Format dates consistently to avoid hydration errors
  const formatDate = (date: Date): string => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

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
          {formatDate(data.calibrationDate)}
        </p>
        <div>
          <span className="font-medium">Recommended Calibration Date:</span>{" "}
          {formatDate(data.recDate)}
          <div className="flex justify-end gap-3">
            <Button variant={"secondary"}>Decline</Button>
            <Button
              className={isAccepted ? "bg-gray-400" : "bg-green-500"}
              onClick={() => !isAccepted && onAccept(data)}
              disabled={isAccepted}
            >
              {isAccepted ? "Added" : "Accept"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
