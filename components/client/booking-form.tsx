"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Clock, Star, User } from "lucide-react";
import { format } from "date-fns";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useClientAuth } from "@/hooks/use-client-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";

const services = [
  {
    id: "Tips and gel",
    name: "Tips and gel Manicure",
    duration: 45,
    price: 500,
  },
  {
    id: "Gel on natural nails",
    name: "Classic manicure",
    duration: 60,
    price: 300,
  },
  {
    id: "Acrylics and nail-art",
    name: "Acrylics-nail Art",
    duration: 90,
    price: 1500,
  },
  { id: "Pedicure", name: "Pedicure", duration: 120, price: 800 },
  { id: "Gum gel", name: "Gum gel", duration: 30, price: 500 },
];

const stylists = [
  {
    id: "sarah",
    name: "Stylist 1",
    specialties: ["Nail Art", "Gel Manicure"],
    rating: 4.9,
    experience: "5+ years",
    image: "/placeholder-user.jpg",
  },
  {
    id: "emma",
    name: "Stylist 2",
    specialties: ["Pedicure", "Spa Treatments"],
    rating: 4.8,
    experience: "3+ years",
    image: "/placeholder-user.jpg",
  },
  {
    id: "lisa",
    name: "Stylist 3",
    specialties: ["Acrylic", "Full Set"],
    rating: 4.9,
    experience: "7+ years",
    image: "/placeholder-user.jpg",
  },
  {
    id: "maria",
    name: "Stylist 4",
    specialties: ["Gel Removal", "Nail Art"],
    rating: 4.7,
    experience: "4+ years",
    image: "/placeholder-user.jpg",
  },
  {
    id: "john",
    name: "Stylist 5",
    specialties: ["Manicure", "Pedicure"],
    rating: 4.6,
    experience: "2+ years",
    image: "/placeholder-user.jpg",
  },
  {
    id: "jane",
    name: "Stylist 6",
    specialties: ["Nail Art", "Spa Treatments"],
    rating: 4.8,
    experience: "6+ years",
    image: "/placeholder-user.jpg",
  },
  {
    id: "david",
    name: "Stylist 7",
    specialties: ["Acrylic", "Full Set"],
    rating: 4.9,
    experience: "8+ years",
    image: "/placeholder-user.jpg",
  },
  {
    id: "susan",
    name: "Stylist 8",
    specialties: ["Gel Manicure", "Pedicure"],
    rating: 4.7,
    experience: "3+ years",
    image: "/placeholder-user.jpg",
  },
];

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
];

interface BookingFormProps {
  onBookingComplete: () => void;
}

export function BookingForm({ onBookingComplete }: BookingFormProps) {
  const { clientProfile } = useClientAuth();
  const { createNotification } = useNotifications(clientProfile?.uid);
  const [selectedService, setSelectedService] = useState("");
  const [selectedStylist, setSelectedStylist] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedServiceData = services.find((s) => s.id === selectedService);
  const selectedStylistData = stylists.find((s) => s.id === selectedStylist);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientProfile || !selectedDate) return;

    setLoading(true);

    try {
      const bookingData = {
        customerName: clientProfile.displayName,
        customerEmail: clientProfile.email,
        customerPhone: clientProfile.phone,
        customerId: clientProfile.uid,
        service: selectedServiceData?.name,
        serviceId: selectedService,
        stylist: selectedStylistData?.name,
        stylistId: selectedStylist,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        status: "pending",
        notes,
        price: selectedServiceData?.price,
        duration: selectedServiceData?.duration,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "bookings"), bookingData);

      // Create notification for admin (using correct admin UID)
      await createNotification(
        "VJdxemjpYTfR3TAfAQDmZ9ucjxB2", // Admin UID from useAdminAuth
        "New Booking Request",
        `${clientProfile.displayName} requested ${selectedServiceData?.name} with ${selectedStylistData?.name}`,
        "booking",
        bookingData,
      );

      // Create notification for client
      await createNotification(
        clientProfile.uid,
        "Booking Submitted",
        `Your booking request for ${selectedServiceData?.name} has been submitted and is pending confirmation.`,
        "booking",
        bookingData,
      );

      toast.success("Booking submitted successfully!");
      onBookingComplete();
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Book Your Appointment</CardTitle>
        <CardDescription>
          Choose your service, stylist, and preferred time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-3">
            <Label>Select Service</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all ${
                    selectedService === service.id
                      ? "ring-2 ring-purple-500 bg-purple-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-gray-500">
                          {service.duration} minutes
                        </p>
                      </div>
                      <Badge variant="secondary">Ksh{service.price}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stylist Selection */}
          <div className="space-y-3">
            <Label>Choose Your Stylist</Label>
            <div className="grid grid-cols-1 gap-3">
              {stylists.map((stylist) => (
                <Card
                  key={stylist.id}
                  className={`cursor-pointer transition-all ${
                    selectedStylist === stylist.id
                      ? "ring-2 ring-purple-500 bg-purple-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedStylist(stylist.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={stylist.image || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{stylist.name}</h3>
                        <p className="text-sm text-gray-500">
                          {stylist.experience}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm ml-1">
                              {stylist.rating}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {stylist.specialties.map((specialty) => (
                              <Badge
                                key={specialty}
                                variant="outline"
                                className="text-xs"
                              >
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <Label>Select Time</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className="text-sm"
                >
                  <Clock className="mr-1 h-3 w-3" />
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes">Special Requests (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or preferences..."
              rows={3}
            />
          </div>

          {/* Booking Summary */}
          {selectedServiceData &&
            selectedStylistData &&
            selectedDate &&
            selectedTime && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Service:</strong> {selectedServiceData.name}
                    </p>
                    <p>
                      <strong>Stylist:</strong> {selectedStylistData.name}
                    </p>
                    <p>
                      <strong>Date:</strong> {format(selectedDate, "PPP")}
                    </p>
                    <p>
                      <strong>Time:</strong> {selectedTime}
                    </p>
                    <p>
                      <strong>Duration:</strong> {selectedServiceData.duration}{" "}
                      minutes
                    </p>
                    <p>
                      <strong>Price:</strong> ${selectedServiceData.price}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              !selectedService ||
              !selectedStylist ||
              !selectedDate ||
              !selectedTime ||
              loading
            }
          >
            {loading ? "Submitting..." : "Book Appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
