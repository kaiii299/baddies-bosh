import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCalendarContext } from "../calendar-context";
// import { format } from "date-fns";
import { DateTimePicker } from "@/components/form/date-time-picker";
import { ColorPicker } from "@/components/form/color-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { generateGoogleCalendarLink } from "@/lib/calendar-utils";
import { ExternalLink } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    start: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start date",
    }),
    end: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid end date",
    }),
    color: z.string(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      try {
        const start = new Date(data.start);
        const end = new Date(data.end);
        return end >= start;
      } catch {
        return false;
      }
    },
    {
      message: "End time must be after start time",
      path: ["end"],
    }
  );

export default function CalendarManageEventDialog() {
  const {
    manageEventDialogOpen,
    setManageEventDialogOpen,
    selectedEvent,
    setSelectedEvent,
    events,
    setEvents,
  } = useCalendarContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      start: "",
      end: "",
      color: "blue",
      description: "",
    },
  });

  useEffect(() => {
    if (selectedEvent) {
      form.reset({
        title: selectedEvent.title,
        start: selectedEvent.start.toISOString(),
        end: selectedEvent.end.toISOString(),
        color: selectedEvent.color,
        description: selectedEvent.description || "",
      });
    }
  }, [selectedEvent, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedEvent) return;

    const updatedEvent = {
      ...selectedEvent,
      title: values.title,
      start: new Date(values.start),
      end: new Date(values.end),
      color: values.color,
      description: values.description,
    };

    setEvents(
      events.map((event) =>
        event.id === selectedEvent.id ? updatedEvent : event
      )
    );
    setManageEventDialogOpen(false);
    setSelectedEvent(null);
  }

  function handleDelete() {
    if (!selectedEvent) return;
    setEvents(events.filter((event) => event.id !== selectedEvent.id));
    setManageEventDialogOpen(false);
    setSelectedEvent(null);
  }

  // Extract tool details from description if it's a calibration event
  const toolDetails = selectedEvent?.description
    ? selectedEvent.description.split(", ").map((item) => {
        const [key, value] = item.split(": ");
        return { key, value };
      })
    : [];

  const isCalibrationEvent = selectedEvent?.title?.startsWith("Calibrate:");

  return (
    <Dialog
      open={manageEventDialogOpen}
      onOpenChange={(open) => {
        setManageEventDialogOpen(open);
        if (!open) setSelectedEvent(null);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isCalibrationEvent ? "Calibration Details" : "Edit Event"}
          </DialogTitle>
          {isCalibrationEvent && (
            <DialogDescription>
              Tool calibration scheduled from the recommendations
            </DialogDescription>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCalibrationEvent && toolDetails.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Tool Information</h3>
                <div className="space-y-1 text-sm">
                  {toolDetails.map((detail, index) => (
                    <div key={index} className="flex">
                      <span className="font-medium w-24">{detail.key}:</span>
                      <span>{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Start</FormLabel>
                  <FormControl>
                    <DateTimePicker field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">End</FormLabel>
                  <FormControl>
                    <DateTimePicker field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Color</FormLabel>
                  <FormControl>
                    <ColorPicker field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between gap-2">
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" type="button">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete event</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this event? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    if (selectedEvent) {
                      const googleCalendarUrl = generateGoogleCalendarLink({
                        ...selectedEvent,
                        start: new Date(form.getValues().start),
                        end: new Date(form.getValues().end),
                        title: form.getValues().title,
                      });
                      window.open(googleCalendarUrl, "_blank");
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Add to Google Calendar
                </Button>
              </div>

              <Button type="submit">Update event</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
