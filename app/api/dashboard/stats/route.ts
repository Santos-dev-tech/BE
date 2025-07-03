import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (role !== "ADMIN" && role !== "STYLIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all bookings
    const bookings = await prisma.booking.findMany({
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        stylist: { select: { id: true, name: true } },
        service: { select: { name: true, duration: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get all clients
    const clients = await prisma.user.findMany({
      where: { role: "CLIENT" },
      select: { id: true, name: true, email: true },
    });

    const today = new Date().toISOString().split("T")[0];

    // Calculate stats
    const todayBookings = bookings.filter(
      (b) => new Date(b.date).toISOString().split("T")[0] === today,
    );

    const pendingBookings = bookings.filter(
      (b) => b.status.toLowerCase() === "pending",
    );

    const completedTodayBookings = todayBookings.filter(
      (b) => b.status.toLowerCase() === "completed",
    );

    const todayRevenue = completedTodayBookings.reduce(
      (sum, booking) => sum + (booking.price || 0),
      0,
    );

    // Create recent activity
    const recentActivity = bookings.slice(0, 4).map((booking) => ({
      time: new Date(booking.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      action: getActionForStatus(booking.status),
      customer: booking.customer.name,
      service: booking.service.name,
    }));

    return NextResponse.json({
      todayBookings: todayBookings.length,
      pendingBookings: pendingBookings.length,
      totalClients: clients.length,
      todayRevenue,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}

function getActionForStatus(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "New booking";
    case "confirmed":
      return "Booking confirmed";
    case "in_progress":
      return "Service started";
    case "completed":
      return "Service completed";
    case "cancelled":
      return "Booking cancelled";
    default:
      return "Booking updated";
  }
}
