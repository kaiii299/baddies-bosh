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
import { Tools } from "@prisma/client";

// Extended type for tool data with calculated fields
type ToolWithCalibration = Tools & {
  calibrationDate: Date;
  recDate: Date;
  risk: number;
  Calendar?: {
    id: string;
    isAccepted: boolean;
    riskLevel: number;
  } | null;
};

// Dynamically import the Calendar component with SSR disabled
const Calendar = dynamic(() => import("@/components/calendar/calendar"), {
  ssr: false,
});

const CalendarPage = () => {
  const [events, setEvents] = React.useState<CalendarEvent[]>(
    generateMockEvents()
  );
  const [tools, setTools] = React.useState<ToolWithCalibration[]>([]);
  const [loading, setLoading] = React.useState(true);
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

  // Fetch tools from the database
  React.useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch("/api/tools");
        if (!response.ok) {
          throw new Error("Failed to fetch tools");
        }

        const data = await response.json();

        // Process the tools to add calculated fields
        const processedTools = data.map((tool: Tools) => {
          // Parse dates from strings
          const lastCalDate = tool.lastCalibration
            ? new Date(tool.lastCalibration)
            : new Date();

          // Calculate recommended calibration date based on interval
          // Default to 6 months if interval is not specified
          const intervalMonths = tool.calibrationInterval
            ? parseInt(tool.calibrationInterval)
            : 6;

          const recDate = new Date(lastCalDate);
          recDate.setMonth(recDate.getMonth() + intervalMonths);

          // Calculate risk level based on remaining months
          let risk = 1; // Low risk by default
          const remainingMonths = tool.remainingMonths
            ? parseInt(tool.remainingMonths)
            : 6;

          if (remainingMonths <= 1) {
            risk = 3; // High risk
          } else if (remainingMonths <= 3) {
            risk = 2; // Medium risk
          }

          return {
            ...tool,
            calibrationDate: lastCalDate,
            recDate,
            risk,
          };
        });

        setTools(processedTools);

        // Load existing calendar events
        const calendarEvents = processedTools
          .filter((tool) => tool.Calendar?.isAccepted)
          .map((tool) => createCalendarEvent(tool));

        setEvents((prev) => [...prev, ...calendarEvents]);

        // Track which tools are already accepted
        const accepted = processedTools
          .filter((tool) => tool.Calendar?.isAccepted)
          .map((tool) => tool.serialIdNo);

        setAcceptedTools(accepted);
      } catch (error) {
        console.error("Error fetching tools:", error);
        toast.error("Failed to load calibration data");
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Create a calendar event from a tool
  const createCalendarEvent = (tool: ToolWithCalibration): CalendarEvent => {
    return {
      id: `tool-${tool.serialIdNo}`,
      title: `Calibrate: ${tool.description}`,
      color: getRiskColor(tool.risk),
      start: tool.recDate,
      end: new Date(
        new Date(tool.recDate).setHours(new Date(tool.recDate).getHours() + 1)
      ), // 1 hour duration
      description: `Tool ID: ${tool.serialIdNo}, Model: ${
        tool.modelPartNo || "N/A"
      }, Risk Level: ${tool.risk}`,
    };
  };

  // Function to add a calibration event to the calendar
  const addCalibrationEvent = async (tool: ToolWithCalibration) => {
    // Mark this tool as animating for accept
    setAnimatingTools((prev) => [
      ...prev,
      { id: tool.serialIdNo, status: "accepting" },
    ]);

    // Create a new event object
    const newEvent = createCalendarEvent(tool);

    try {
      // Save to database
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: tool.serialIdNo,
          isAccepted: true,
          riskLevel: tool.risk,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save calendar event");
      }

      // Add the new event to the events array after animation completes
      setTimeout(() => {
        setEvents((prevEvents) => [...prevEvents, newEvent]);

        // Mark this tool as accepted
        setAcceptedTools((prev) => [...prev, tool.serialIdNo]);

        // Set the calendar date to the recommended calibration date
        setDate(new Date(tool.recDate));

        // Show success notification
        toast.success("Calibration event added", {
          description: `${tool.description} scheduled for ${formatDate(
            tool.recDate
          )}`,
          duration: 4000,
        });
      }, 700);
    } catch (error) {
      console.error("Error saving calendar event:", error);
      toast.error("Failed to save calibration event");

      // Remove from animating if there was an error
      setAnimatingTools((prev) =>
        prev.filter((item) => item.id !== tool.serialIdNo)
      );
    }
  };

  // Function to decline a tool calibration
  const declineTool = async (tool: ToolWithCalibration) => {
    // Mark this tool as animating for decline
    setAnimatingTools((prev) => [
      ...prev,
      { id: tool.serialIdNo, status: "declining" },
    ]);

    try {
      // Save to database as declined
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: tool.serialIdNo,
          isAccepted: false,
          riskLevel: tool.risk,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save declined status");
      }

      // Mark as declined after animation completes
      setTimeout(() => {
        setDeclinedTools((prev) => [...prev, tool.serialIdNo]);

        // Show info notification
        toast.info("Calibration suggestion declined", {
          description: `${tool.description} (ID: ${tool.serialIdNo}) has been removed from suggestions`,
          duration: 3000,
        });
      }, 700);
    } catch (error) {
      console.error("Error saving declined status:", error);
      toast.error("Failed to decline calibration suggestion");

      // Remove from animating if there was an error
      setAnimatingTools((prev) =>
        prev.filter((item) => item.id !== tool.serialIdNo)
      );
    }
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
    return tools.filter(
      (tool) =>
        !acceptedTools.includes(tool.serialIdNo) &&
        !declinedTools.includes(tool.serialIdNo) &&
        !animatingTools.some((item) => item.id === tool.serialIdNo) &&
        !tool.Calendar?.isAccepted
    );
  }, [tools, acceptedTools, declinedTools, animatingTools]);

  // Get tools that are currently animating
  const animatingToolsData = React.useMemo(() => {
    return animatingTools
      .map((animTool) => {
        const toolData = tools.find((tool) => tool.serialIdNo === animTool.id);
        return toolData
          ? { ...toolData, animationStatus: animTool.status }
          : null;
      })
      .filter(Boolean) as (ToolWithCalibration & {
      animationStatus: "accepting" | "declining";
    })[];
  }, [animatingTools, tools]);

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
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading calibration suggestions...
                </div>
              ) : (
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
                  {filteredTools.map((tool) => (
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
              )}

              {!loading &&
                filteredTools.length === 0 &&
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
  data: ToolWithCalibration,
  formatDate: (date: Date) => string,
  onAccept?: () => void,
  onDecline?: () => void
) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg">{data.description}</p>
          <p className="text-sm text-gray-500">
            ID: {data.serialIdNo} | Model: {data.modelPartNo || "N/A"}
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
          <span className="font-medium">Last Calibration:</span>{" "}
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
