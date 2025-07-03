"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClientAuth } from "@/hooks/use-client-auth";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { BookingForm } from "./booking-form";
import { ClientMessaging } from "./client-messaging";
import { Calendar, User, Clock, LogOut, Sparkles } from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Booking {
  id: string;
  service: string;
  stylist: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  price: number;
  createdAt: Timestamp;
}

export default function ClientDashboard() {
  const { clientProfile, logout } = useClientAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!clientProfile) return;

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        const response = await fetch(
          `/api/bookings?userId=${clientProfile.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const bookingsData = await response.json();
          const formattedBookings = bookingsData.map((booking: any) => ({
            id: booking.id,
            service: booking.service.name,
            stylist: booking.stylist.name,
            date: new Date(booking.date).toLocaleDateString(),
            time: booking.time,
            status: booking.status.toLowerCase(),
            price: booking.price,
            createdAt: new Date(booking.createdAt),
          }));
          setUserBookings(formattedBookings);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();

    // Set up polling for updates
    const interval = setInterval(fetchBookings, 30000);

    return () => clearInterval(interval);
  }, [clientProfile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const upcomingBookings = userBookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending",
  );
  const pastBookings = userBookings.filter((b) => b.status === "completed");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  BeautyExpress
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {clientProfile?.displayName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {clientProfile && <NotificationBell userId={clientProfile.uid} />}
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="book">Book Appointment</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Upcoming
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {upcomingBookings.length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Completed
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {pastBookings.length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Spent
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        $
                        {pastBookings.reduce(
                          (sum, booking) => sum + (booking.price || 0),
                          0,
                        )}
                      </p>
                    </div>
                    <Sparkles className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{booking.service}</h3>
                            <p className="text-sm text-gray-500">
                              with {booking.stylist}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.date} at {booking.time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            ${booking.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking History */}
            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>Your past appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {userBookings.length > 0 ? (
                  <div className="space-y-4">
                    {userBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{booking.service}</h3>
                            <p className="text-sm text-gray-500">
                              with {booking.stylist}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.date} at {booking.time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            ${booking.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No bookings yet. Book your first appointment!</p>
                    <Button
                      className="mt-4"
                      onClick={() => setActiveTab("book")}
                    >
                      Book Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="book">
            <BookingForm onBookingComplete={() => setActiveTab("bookings")} />
          </TabsContent>

          <TabsContent value="messages">
            {clientProfile && (
              <ClientMessaging
                clientId={clientProfile.uid}
                clientName={clientProfile.displayName}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
