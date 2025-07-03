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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sparkles,
  LogOut,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Play,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChatWindow } from "@/components/chat/chat-window";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Booking {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  service: {
    name: string;
    duration: number;
  };
  date: string;
  time: string;
  status: string;
  notes?: string;
  price: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  createdAt: string;
}

export default function StylistDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user-data");
    if (!userData) {
      router.push("/auth/stylist/signin");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "STYLIST") {
      router.push("/auth/stylist/signin");
      return;
    }

    setUser(parsedUser);
    fetchBookings();
  }, [router]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const userData = JSON.parse(localStorage.getItem("user-data") || "{}");

      const response = await fetch(`/api/bookings?role=${userData.role}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const bookingsData = await response.json();
        // Filter bookings for this specific stylist
        const stylistBookings = bookingsData.filter(
          (booking: any) => booking.stylist.id === userData.id,
        );
        setBookings(stylistBookings);
      } else {
        toast.error("Unable to load bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Error loading bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: status.toUpperCase() }),
      });

      if (response.ok) {
        await fetchBookings(); // Refresh bookings
        toast.success(`Service ${status.toLowerCase().replace("_", " ")}`);
      } else {
        throw new Error("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-data");
    router.push("/auth/stylist/signin");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStats = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayBookings = bookings.filter(
      (b) => b.date.split("T")[0] === today,
    );

    return {
      today: todayBookings.length,
      pending: bookings.filter((b) => b.status.toLowerCase() === "pending")
        .length,
      inProgress: bookings.filter(
        (b) => b.status.toLowerCase() === "in_progress",
      ).length,
      completed: bookings.filter((b) => b.status.toLowerCase() === "completed")
        .length,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Stylist Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Today's Appointments
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.today}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.inProgress}
                  </p>
                </div>
                <Play className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completed}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="chat">Client Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Client Bookings</CardTitle>
                <CardDescription>
                  Manage your appointments and client services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder-user.jpg" />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {booking.customer.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.customer.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {booking.service.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.service.duration} min
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>
                                {new Date(booking.date).toLocaleDateString()}
                              </span>
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{booking.time}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>${booking.price}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {booking.status.toLowerCase() === "confirmed" && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking.id,
                                      "in_progress",
                                    )
                                  }
                                  className="bg-purple-600 hover:bg-purple-700"
                                  title="Start service"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              {booking.status.toLowerCase() ===
                                "in_progress" && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    updateBookingStatus(booking.id, "completed")
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                  title="Complete service"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedClient({
                                    id: booking.customer.id,
                                    name: booking.customer.name,
                                  });
                                  setActiveTab("chat");
                                }}
                                title="Chat with client"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Client Communication</CardTitle>
                <CardDescription>
                  {selectedClient
                    ? `Chatting with ${selectedClient.name}`
                    : "Select a client from your bookings to start chatting"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedClient && user ? (
                  <ChatWindow
                    currentUserId={user.id}
                    currentUserName={user.name || user.email}
                    otherUserId={selectedClient.id}
                    otherUserName={selectedClient.name}
                    title="Client Chat"
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>
                      Select a client from your bookings to start a conversation
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => setActiveTab("bookings")}
                    >
                      View Bookings
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
