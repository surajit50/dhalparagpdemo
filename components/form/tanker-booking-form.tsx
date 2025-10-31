"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, Loader2, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBooking } from "@/action/bookings";
import { ServiceType } from "@prisma/client";
import { getServiceFee } from "@/action/service-fee";
import { formatDate } from "@/utils/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { getAvailableSlots } from "@/action/availability";

const formSchema = z.object({
  serviceType: z.enum(["WATER_TANKER", "DUSTBIN_VAN"]),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z
    .string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits"),
  bookingDate: z.date({ required_error: "Booking date is required" }),
  amount: z.number(),
});

export default function TankerBookingForm() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: "WATER_TANKER",
      name: "",
      address: "",
      phone: "",
      bookingDate: undefined,
      amount: 0,
    },
  });

  const serviceType = form.watch("serviceType");
  const bookingDate = form.watch("bookingDate");

  // Set initial booking date from URL
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      try {
        const parsedDate = new Date(dateParam);
        if (!isNaN(parsedDate.getTime())) {
          form.setValue("bookingDate", parsedDate);
        }
      } catch (error) {
        console.error("Invalid date parameter:", error);
      }
    }
  }, [searchParams, form]);

  // Fetch service fee
  const { data: feeData, error: feeError } = useQuery({
    queryKey: ["serviceFee", serviceType],
    queryFn: () => getServiceFee(serviceType),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (feeData?.success && feeData.data?.amount) {
      form.setValue("amount", feeData.data.amount);
    }
    if (feeError) {
      toast({
        title: "Error",
        description: "Failed to fetch service fee",
        variant: "destructive",
      });
    }
  }, [feeData, feeError, form, toast]);

  // Fetch available slots
  const {
    data: availableSlots,
    isFetching: isFetchingSlots,
    error: slotsError,
    refetch: refetchSlots,
  } = useQuery({
    queryKey: ["availableSlots", serviceType, bookingDate?.toISOString()],
    queryFn: () => {
      if (!bookingDate) return { success: false, data: 0 };
      return getAvailableSlots(serviceType, bookingDate);
    },
    refetchOnWindowFocus: false,
    enabled: !!bookingDate,
  });

  useEffect(() => {
    if (slotsError) {
      toast({
        title: "Availability Error",
        description: "Failed to check available slots",
        variant: "destructive",
      });
    }
  }, [slotsError, toast]);

  // Handle service type change
  const handleServiceTypeChange = (value: ServiceType) => {
    form.setValue("serviceType", value);
    form.setValue("amount", 0);
    if (bookingDate) refetchSlots();
  };

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      createBooking({
        ...values,
        bookingDate: values.bookingDate,
      }),
    onSuccess: (result, values) => {
      if (result.success) {
        toast({
          title: "Booking successful!",
          description: `Your ${values.serviceType
            .toLowerCase()
            .replace("_", " ")} has been booked for ${formatDate(
            values.bookingDate
          )}`,
        });
        form.reset();
        router.refresh();
      } else {
        toast({
          title: "Booking failed",
          description: result.error || "Please try again later",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Form submit handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    bookingMutation.mutate(values);
  };

  const isPending = bookingMutation.isPending;
  const slotsAvailable = availableSlots?.data || 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Tanker Booking
        </CardTitle>
        <CardDescription>
          Schedule your water tanker or dustbin van service
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        handleServiceTypeChange(value as ServiceType);
                        field.onChange(value);
                      }}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WATER_TANKER">
                          Water Tanker
                        </SelectItem>
                        <SelectItem value="DUSTBIN_VAN">
                          Dustbin Van
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Service Fee (₹)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                          disabled
                          className="text-xl font-bold text-primary bg-primary/5 border-primary/20 focus-visible:ring-primary"
                        />
                        {!feeData && (
                          <div className="absolute inset-y-0 right-3 flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your full name"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        pattern="[0-9]{10}"
                        placeholder="Enter 10-digit number"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter your complete address"
                      rows={3}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bookingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <FormLabel>Booking Date</FormLabel>
                    {isFetchingSlots && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Checking availability...
                      </span>
                    )}
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isPending || isFetchingSlots}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            formatDate(field.value)
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {field.value && !isFetchingSlots && (
                    <div className={cn(
                      "text-sm mt-1 font-medium",
                      slotsAvailable > 0 ? "text-green-600" : "text-destructive"
                    )}>
                      {slotsAvailable > 0 ? (
                        <span>{slotsAvailable} slot{slotsAvailable > 1 ? 's' : ''} available</span>
                      ) : (
                        <span>No slots available</span>
                      )}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={
                isPending || 
                !bookingDate || 
                slotsAvailable <= 0 ||
                isFetchingSlots
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                slotsAvailable > 0 ? "Book Service" : "No Slots Available"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
