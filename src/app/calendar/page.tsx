"use client";
import React from "react";
import dynamic from "next/dynamic";
import { CalendarEvent, Mode } from "@/components/calendar/calendar-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Import the dataset
import boschData from "../data/Bosch_Dataset_Predictions.json";
import { generateGoogleCalendarLink } from "@/lib/calendar-utils";
import { ExternalLink } from "lucide-react";
import { formatDisplayDate } from "@/lib/calendar-utils";

// Define the type for the Bosch dataset items
type BoschToolData = {
  div: string;
  description: string;
  standard: string;
  category: string;
  brand: string;
  tag: string;
  modelPartNo: string;
  serialIdNo: string;
  range: string;
  externalToleranceLimit: string;
  internalTolerenceLimit: string;
  inUse: string;
  calibrationInterval: string;
  lastCalibration: string;
  calibrationDue: string;
  remainingMths: string;
  externalCal: string;
  calibrationReportNumber: string;
  calibrator: string;
  pic: string;
  actionForRenewalReminder: string;
  status: string;
  predictedIdealCalibrationDate: string;
  differenceFromPredictions: number;
  predictionValue: number;
};

// Function to parse date strings from the dataset
const parseDate = (dateString: string): Date | null => {
  if (!dateString || dateString === "NaT") return null;
  return new Date(dateString);
};

// Helper function to map status to color
const getStatusColor = (status: string): string => {
  switch (status) {
    case "Optimal":
      return "green";
    case "Drifting":
      return "orange";
    case "Overdue":
      return "red";
    default:
      return "yellow";
  }
};

// Dynamically import the Calendar component with SSR disabled
const Calendar = dynamic(() => import("@/components/calendar/calendar"), {
  ssr: false,
});

const CalendarPage = () => {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [mode, setMode] = React.useState<Mode>("month");
  const [date, setDate] = React.useState<Date>(new Date());
  const [acceptedTools, setAcceptedTools] = React.useState<string[]>([]);
  const [declinedTools, setDeclinedTools] = React.useState<string[]>([]);
  const [animatingTools, setAnimatingTools] = React.useState<
    {
      id: string;
      status: "accepting" | "declining";
    }[]
  >([]);

  // Function to add a calibration event to the calendar
  const addCalibrationEvent = (tool: BoschToolData) => {
    // Mark this tool as animating for accept
    setAnimatingTools((prev) => [
      ...prev,
      { id: tool.serialIdNo, status: "accepting" },
    ]);

    // Get the date to use (either predicted date or due date)
    const eventDate =
      parseDate(tool.predictedIdealCalibrationDate) ||
      parseDate(tool.calibrationDue);

    if (!eventDate) {
      toast.error("Invalid date for this tool");
      return;
    }

    // Create a new event object
    const newEvent: CalendarEvent = {
      id: `tool-${tool.serialIdNo}-${Date.now()}`, // Create a unique ID
      title: `Calibrate: ${tool.description}`,
      color: getStatusColor(tool.status),
      start: eventDate,
      end: new Date(
        new Date(eventDate).setHours(new Date(eventDate).getHours() + 1)
      ), // 1 hour duration
      description: `Tool ID: ${tool.serialIdNo}, Model: ${tool.modelPartNo}, Brand: ${tool.brand}, Status: ${tool.status}`,
    };

    // Add the new event to the events array after animation completes
    setTimeout(() => {
      setEvents((prevEvents) => [...prevEvents, newEvent]);

      // Mark this tool as accepted
      setAcceptedTools((prev) => [...prev, tool.serialIdNo]);

      // Set the calendar date to the event date
      setDate(eventDate);

      // Show success notification
      toast.success("Calibration event added", {
        description: `${tool.description} scheduled for ${formatDate(
          eventDate
        )}`,
        duration: 4000,
      });
    }, 700);
  };

  // Function to decline a tool calibration
  const declineTool = (tool: BoschToolData) => {
    // Mark this tool as animating for decline
    setAnimatingTools((prev) => [
      ...prev,
      { id: tool.serialIdNo, status: "declining" },
    ]);

    // Mark as declined after animation completes
    setTimeout(() => {
      setDeclinedTools((prev) => [...prev, tool.serialIdNo]);

      // Show info notification
      toast.info("Calibration suggestion declined", {
        description: `${tool.description} (ID: ${tool.serialIdNo}) has been removed from suggestions`,
        duration: 3000,
      });
    }, 700);
  };

  // Format dates consistently to avoid hydration errors
  const formatDate = (date: Date): string => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Filter and sort tools that need attention
  const toolsNeedingAttention = React.useMemo(() => {
    // Filter out tools that have been accepted or declined
    const filteredTools = boschData.filter(
      (tool) =>
        !acceptedTools.includes(tool.serialIdNo) &&
        !declinedTools.includes(tool.serialIdNo) &&
        !animatingTools.some((animTool) => animTool.id === tool.serialIdNo)
    );

    // Sort the tools by status priority: Overdue > Drifting > Others
    return filteredTools.sort((a, b) => {
      // First prioritize by status
      if (a.status === "Overdue" && b.status !== "Overdue") return -1;
      if (a.status !== "Overdue" && b.status === "Overdue") return 1;
      if (a.status === "Drifting" && b.status !== "Drifting") return -1;
      if (a.status !== "Drifting" && b.status === "Drifting") return 1;

      // Then sort by remaining months (if both have the same status)
      const aMonths = parseFloat(a.remainingMths);
      const bMonths = parseFloat(b.remainingMths);

      if (isNaN(aMonths) && !isNaN(bMonths)) return 1;
      if (!isNaN(aMonths) && isNaN(bMonths)) return -1;
      if (!isNaN(aMonths) && !isNaN(bMonths)) return aMonths - bMonths;

      // If all else is equal, sort by description
      return a.description.localeCompare(b.description);
    });
  }, [acceptedTools, declinedTools, animatingTools]);

  // Get tools that are currently animating
  const animatingToolsData = React.useMemo(() => {
    return animatingTools
      .map((animTool) => {
        const toolData = boschData.find(
          (tool: BoschToolData) => tool.serialIdNo === animTool.id
        );
        return toolData
          ? { ...toolData, animationStatus: animTool.status }
          : null;
      })
      .filter(Boolean) as (BoschToolData & {
      animationStatus: "accepting" | "declining";
    })[];
  }, [animatingTools]);

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-4">Your Calendar</h2>
      <div className="flex gap-4 flex-col mb-6">
        <Card className="h-[500px] overflow-hidden">
          <CardHeader>
            <CardTitle>Suggested tools for calibration</CardTitle>
            <CardDescription>
              Based on predicted calibration dates and status
            </CardDescription>
          </CardHeader>
          <ScrollArea className="w-full h-full pb-20">
            <CardContent className="gap-4 flex flex-col">
              <AnimatePresence>
                {/* Animating tools */}
                {animatingToolsData.map((tool) => (
                  <motion.div
                    key={`animating-${tool.serialIdNo}`}
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
                          prev.filter((item) => item.id !== tool.serialIdNo)
                        );
                      }, 100);
                    }}
                  >
                    {renderCardContent(tool, formatDate)}
                  </motion.div>
                ))}

                {/* Regular tools */}
                {toolsNeedingAttention.map((tool: BoschToolData) => (
                  <motion.div
                    key={`tool-${tool.serialIdNo}`}
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

              {toolsNeedingAttention.length === 0 &&
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

const statusColors: Record<string, string> = {
  Optimal: "bg-green-500 text-white",
  Drifting: "bg-orange-500 text-white",
  Overdue: "bg-red-500 text-white",
  "": "bg-yellow-500 text-black", // Default
};

// Function to render the card content
const renderCardContent = (
  data: BoschToolData,
  formatDate: (date: Date) => string,
  onAccept?: () => void,
  onDecline?: () => void
) => {
  const dueDate = parseDate(data.calibrationDue);
  const predictedDate = parseDate(data.predictedIdealCalibrationDate);
  const lastCalDate = parseDate(data.lastCalibration);

  // Get the date to use (either predicted date or due date)
  const eventDate = predictedDate || dueDate;

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg">{data.description}</p>
          <p className="text-sm text-gray-500">
            ID: {data.serialIdNo} | Brand: {data.brand}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[data.status] || statusColors[""]
          }`}
        >
          {data.status === "Overdue"
            ? data.status
            : data.status === "Drifting"
            ? "Calibrate Soon"
            : `${data.remainingMths} months left`}
        </div>
      </div>

      <div className="text-sm text-gray-700 space-y-1">
        {lastCalDate && (
          <p>
            <span className="font-medium">Last Calibration:</span>{" "}
            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">
              {formatDisplayDate(lastCalDate)}
            </span>
          </p>
        )}
        {dueDate && (
          <p>
            <span className="font-medium">Due Date:</span>{" "}
            <span className="bg-amber-50 px-2 py-0.5 rounded text-amber-800">
              {formatDisplayDate(dueDate)}
            </span>
          </p>
        )}
        {predictedDate && (
          <p>
            <span className="font-medium">Recommended Date:</span>{" "}
            <span className="bg-green-50 px-2 py-0.5 rounded text-green-800">
              {formatDisplayDate(predictedDate)}
            </span>
          </p>
        )}
        <p>
          <span className="font-medium">Calibrator:</span> {data.calibrator}
        </p>
        {onAccept && onDecline && (
          <div className="flex justify-end gap-3 pt-2">
            {eventDate && (
              <Button
                variant="outline"
                onClick={() => {
                  const tempEvent = {
                    id: `tool-${data.serialIdNo}`,
                    title: `Calibrate: ${data.description}`,
                    color: getStatusColor(data.status),
                    start: eventDate,
                    end: new Date(
                      new Date(eventDate).setHours(
                        new Date(eventDate).getHours() + 1
                      )
                    ),
                    description: `Tool ID: ${data.serialIdNo}, Model: ${data.modelPartNo}, Brand: ${data.brand}, Status: ${data.status}`,
                  };
                  const googleCalendarUrl =
                    generateGoogleCalendarLink(tempEvent);
                  window.open(googleCalendarUrl, "_blank");
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Google Calendar
              </Button>
            )}
            <Button variant={"secondary"} onClick={onDecline}>
              Decline
            </Button>

            <Button className="bg-green-500" onClick={onAccept}>
              Accept
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CalendarPage;
