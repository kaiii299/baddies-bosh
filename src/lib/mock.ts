import { CalendarEvent } from "@/components/calendar/calendar-types";
import { addDays, startOfMonth } from "date-fns";
import { colorOptions } from "@/components/calendar/calendar-tailwind-classes";

const CALIBRATION_EVENT_TITLES = [
  "Torque Wrench Calibration",
  "Pressure Gauge Inspection",
  "Micrometer Calibration",
  "Digital Caliper Verification",
  "Force Gauge Calibration",
  "Dial Indicator Check",
  "Multimeter Calibration",
  "Hardness Tester Verification",
  "Temperature Probe Calibration",
  "Roughness Tester Check",
  "Weighing Scale Calibration",
  "Calibration Team Meeting",
  "Calibration Standards Review",
  "Tool Inventory Audit",
  "Calibration Training Session",
];

// Tool brands for more realistic event descriptions
const TOOL_BRANDS = [
  "Mitutoyo",
  "Fluke",
  "Starrett",
  "Tohnichi",
  "Mahr",
  "Bosch",
  "Stahlwille",
  "Rexroth",
  "AIKOH",
  "Hengliang",
  "TESA",
  "KANON",
];

// Tool IDs for more realistic event descriptions
const generateToolID = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  // Generate something like "12345ABC" or "78901XYZ"
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  for (let i = 0; i < 3; i++) {
    id += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  return id;
};

// Extract color values from colorOptions
const EVENT_COLORS = colorOptions.map((color) => color.value);

function getRandomTime(date: Date): Date {
  const hours = Math.floor(Math.random() * 9) + 8; // 8 AM to 5 PM (business hours)
  const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
  return new Date(date.setHours(hours, minutes, 0, 0));
}

function generateEventDuration(): number {
  // Calibration events typically take 30, 60, or 90 minutes
  const durations = [30, 60, 90];
  return durations[Math.floor(Math.random() * durations.length)];
}

// Generate a more detailed description for calibration events
function generateEventDescription(
  title: string,
  brand: string,
  toolId: string
): string {
  if (
    title.includes("Meeting") ||
    title.includes("Review") ||
    title.includes("Audit") ||
    title.includes("Training")
  ) {
    return `Internal event for calibration team`;
  }

  return `Tool ID: ${toolId}, Brand: ${brand}, Location: Calibration Lab`;
}

export function generateMockEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const startDate = startOfMonth(new Date());

  // Generate 120 events over 3 months
  for (let i = 0; i < 120; i++) {
    // Random date between start and end
    const daysToAdd = Math.floor(Math.random() * 90); // 90 days = ~3 months
    const eventDate = addDays(startDate, daysToAdd);

    const startTime = getRandomTime(eventDate);
    const durationMinutes = generateEventDuration();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const title =
      CALIBRATION_EVENT_TITLES[
        Math.floor(Math.random() * CALIBRATION_EVENT_TITLES.length)
      ];
    const brand = TOOL_BRANDS[Math.floor(Math.random() * TOOL_BRANDS.length)];
    const toolId = generateToolID();

    events.push({
      id: `event-${i + 1}`,
      title: title,
      color: EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)],
      start: startTime,
      end: endTime,
      description: generateEventDescription(title, brand, toolId),
    });
  }

  // Sort events by start date
  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}
