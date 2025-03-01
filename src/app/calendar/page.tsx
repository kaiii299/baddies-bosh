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
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
    id: 267755, // Fixed duplicate ID
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
  const [declinedTools, setDeclinedTools] = React.useState<number[]>([]);
  const [animatingTools, setAnimatingTools] = React.useState<
    {
      id: number;
      status: "accepting" | "declining";
    }[]
  >([]);

  // Function to add a calibration event to the calendar
  const addCalibrationEvent = (tool: data) => {
    // Mark this tool as animating for accept
    setAnimatingTools((prev) => [
      ...prev,
      { id: tool.id, status: "accepting" },
    ]);

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

    // Add the new event to the events array after animation completes
    setTimeout(() => {
      setEvents((prevEvents) => [...prevEvents, newEvent]);

      // Mark this tool as accepted
      setAcceptedTools((prev) => [...prev, tool.id]);

      // Set the calendar date to the recommended calibration date
      setDate(new Date(tool.recDate));

      // Show success notification
      toast.success("Calibration event added", {
        description: `${tool.tooldesc} scheduled for ${formatDate(
          tool.recDate
        )}`,
        duration: 4000,
      });
    }, 700);
  };

  // Function to decline a tool calibration
  const declineTool = (tool: data) => {
    // Mark this tool as animating for decline
    setAnimatingTools((prev) => [
      ...prev,
      { id: tool.id, status: "declining" },
    ]);

    // Mark as declined after animation completes
    setTimeout(() => {
      setDeclinedTools((prev) => [...prev, tool.id]);

      // Show info notification
      toast.info("Calibration suggestion declined", {
        description: `${tool.tooldesc} (ID: ${tool.id}) has been removed from suggestions`,
        duration: 3000,
      });
    }, 700);
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

  // Format dates consistently to avoid hydration errors
  const formatDate = (date: Date): string => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Filter out tools that have been accepted or declined
  const filteredTools = React.useMemo(() => {
    return mockData.filter(
      (tool) =>
        !acceptedTools.includes(tool.id) &&
        !declinedTools.includes(tool.id) &&
        !animatingTools.some((item) => item.id === tool.id)
    );
  }, [acceptedTools, declinedTools, animatingTools]);

  // Get tools that are currently animating
  const animatingToolsData = React.useMemo(() => {
    return animatingTools
      .map((animTool) => {
        const toolData = mockData.find((tool) => tool.id === animTool.id);
        return { ...toolData, animationStatus: animTool.status };
      })
      .filter(Boolean) as (data & {
      animationStatus: "accepting" | "declining";
    })[];
  }, [animatingTools]);

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-4">Your Calendar</h2>
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
              <AnimatePresence>
                {/* Animating tools */}
                {animatingToolsData.map((tool) => (
                  <motion.div
                    key={`animating-${tool.id}`}
                    className="p-4 border rounded-lg bg-white shadow-md space-y-2"
                    initial={{ opacity: 1, x: 0 }}
                    animate={
                      tool.animationStatus === "accepting"
                        ? { opacity: 0, x: 100, backgroundColor: "#d1fae5" }
                        : { opacity: 0, x: -100, backgroundColor: "#fee2e2" }
                    }
                    exit={{
                      opacity: 0,
                      height: 0,
                      marginBottom: 0,
                      padding: 0,
                    }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    onAnimationComplete={() => {
                      // Remove from animating list after animation completes
                      setTimeout(() => {
                        setAnimatingTools((prev) =>
                          prev.filter((item) => item.id !== tool.id)
                        );
                      }, 100);
                    }}
                  >
                    {renderCardContent(tool, formatDate)}
                  </motion.div>
                ))}

                {/* Regular tools */}
                {filteredTools.map((tool) => (
                  <motion.div
                    key={`tool-${tool.id}`}
                    className="p-4 border rounded-lg bg-white shadow-md space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderCardContent(
                      tool,
                      formatDate,
                      () => addCalibrationEvent(tool),
                      () => declineTool(tool)
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTools.length === 0 &&
                animatingToolsData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending calibration suggestions
                  </div>
                )}
            </CardContent>
          </ScrollArea>
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

// Function to render the card content
const renderCardContent = (
  data: data,
  formatDate: (date: Date) => string,
  onAccept?: () => void,
  onDecline?: () => void
) => {
  return (
    <>
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
          {onAccept && onDecline && (
            <div className="flex justify-end gap-3">
              <Button variant={"secondary"} onClick={onDecline}>
                Decline
              </Button>
              <Button className="bg-green-500" onClick={onAccept}>
                Accept
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CalendarPage;
