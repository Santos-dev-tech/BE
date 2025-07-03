"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  stylist: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "in_progress";
  notes?: string;
  price?: number;
  createdAt: Date;
}

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
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
          const formattedBookings = bookingsData.map((booking: any) => ({
            id: booking.id,
            customerName: booking.customer.name,
            customerEmail: booking.customer.email,
            customerPhone: booking.customer.phone,
            service: booking.service.name,
            stylist: booking.stylist.name,
            date: new Date(booking.date).toLocaleDateString(),
            time: booking.time,
            status: booking.status.toLowerCase(),
            notes: booking.notes,
            price: booking.price,
            createdAt: new Date(booking.createdAt),
          }));
          setBookings(formattedBookings);
        } else {
          toast.error("Unable to load bookings");
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Error loading bookings");
      }
    };

    fetchBookings();

    // Set up polling for real-time updates
    const interval = setInterval(fetchBookings, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = bookings;

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.customerEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.service.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, searchTerm]);

  const updateBookingStatus = async (
    bookingId: string,
    status: Booking["status"],
  ) => {
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
        // Update local state
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId ? { ...booking, status } : booking,
          ),
        );
        toast.success(`Booking ${status}`);
      } else {
        throw new Error("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings Management</CardTitle>
        <CardDescription>
          Manage customer appointments and reservations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search customers, services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:max-w-xs">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Stylist</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-sm text-gray-500">
                        {booking.customerEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{booking.service}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{booking.date}</span>
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{booking.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>{booking.stylist}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateBookingStatus(booking.id, "confirmed")
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateBookingStatus(booking.id, "cancelled")
                            }
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateBookingStatus(booking.id, "completed")
                          }
                        >
                          Complete
                        </Button>
                      )}
                      <Dialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                            <DialogDescription>
                              View and manage booking information
                            </DialogDescription>
                          </DialogHeader>
                          {selectedBooking && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Customer Name</Label>
                                  <p className="font-medium">
                                    {selectedBooking.customerName}
                                  </p>
                                </div>
                                <div>
                                  <Label>Service</Label>
                                  <p className="font-medium">
                                    {selectedBooking.service}
                                  </p>
                                </div>
                                <div>
                                  <Label>Date</Label>
                                  <p className="font-medium">
                                    {selectedBooking.date}
                                  </p>
                                </div>
                                <div>
                                  <Label>Time</Label>
                                  <p className="font-medium">
                                    {selectedBooking.time}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <Label>Contact Information</Label>
                                <div className="space-y-1 mt-1">
                                  <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span>{selectedBooking.customerEmail}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span>{selectedBooking.customerPhone}</span>
                                  </div>
                                </div>
                              </div>
                              {selectedBooking.notes && (
                                <div>
                                  <Label>Notes</Label>
                                  <p className="mt-1 text-sm text-gray-600">
                                    {selectedBooking.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
