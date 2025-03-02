import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { format } from "date-fns";
import { DateTimePicker } from "@/components/form/date-time-picker";
import { ColorPicker } from "@/components/form/color-picker";
import { generateGoogleCalendarLink } from "@/lib/calendar-utils";
import { ExternalLink } from "lucide-react";

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    start: z.string().datetime(),
    end: z.string().datetime(),
    color: z.string(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start);
      const end = new Date(data.end);
      return end >= start;
    },
    {
      message: "End time must be after start time",
      path: ["end"],
    }
  );

export default function CalendarNewEventDialog() {
  const { newEventDialogOpen, setNewEventDialogOpen, date, events, setEvents } =
    useCalendarContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      start: format(date, "yyyy-MM-dd'T'HH:mm"),
      end: format(date, "yyyy-MM-dd'T'HH:mm"),
      color: "blue",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newEvent = {
      id: crypto.randomUUID(),
      title: values.title,
      start: new Date(values.start),
      end: new Date(values.end),
      color: values.color,
    };

    setEvents([...events, newEvent]);
    setNewEventDialogOpen(false);
    form.reset();
  }

  return (
    <Dialog open={newEventDialogOpen} onOpenChange={setNewEventDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
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
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  const formValues = form.getValues();
                  if (formValues.title && formValues.start && formValues.end) {
                    const tempEvent = {
                      id: "temp-id",
                      title: formValues.title,
                      start: new Date(formValues.start),
                      end: new Date(formValues.end),
                      color: formValues.color,
                    };
                    const googleCalendarUrl =
                      generateGoogleCalendarLink(tempEvent);
                    window.open(googleCalendarUrl, "_blank");
                  } else {
                    form.trigger();
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Add to Google Calendar
              </Button>
              <Button type="submit">Create event</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
