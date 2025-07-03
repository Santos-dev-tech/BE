import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const stylistId = searchParams.get("stylistId");

    let bookings;
    if (role === "ADMIN") {
      // Admin can see all bookings
      bookings = await prisma.booking.findMany({
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          stylist: { select: { id: true, name: true } },
          service: { select: { name: true, duration: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "STYLIST") {
      // Stylist can see all bookings (they will filter on the frontend)
      bookings = await prisma.booking.findMany({
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          stylist: { select: { id: true, name: true } },
          service: { select: { name: true, duration: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (stylistId) {
      // Filter by specific stylist
      bookings = await prisma.booking.findMany({
        where: { stylistId },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          stylist: { select: { id: true, name: true } },
          service: { select: { name: true, duration: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (userId) {
      // Client can only see their own bookings
      bookings = await prisma.booking.findMany({
        where: { customerId: userId },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          stylist: { select: { id: true, name: true } },
          service: { select: { name: true, duration: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, stylistId, serviceId, date, time, notes, price } = body;

    const booking = await prisma.booking.create({
      data: {
        customerId,
        stylistId,
        serviceId,
        date: new Date(date),
        time,
        notes,
        price: parseFloat(price),
        status: "PENDING",
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        stylist: { select: { id: true, name: true } },
        service: { select: { name: true, duration: true } },
      },
    });

    // Create notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: customerId,
          title: "Booking Submitted",
          message: `Your booking request has been submitted and is pending confirmation.`,
          type: "BOOKING",
        },
        {
          userId: stylistId,
          title: "New Booking Request",
          message: `${booking.customer.name} requested a booking for ${booking.service.name}`,
          type: "BOOKING",
        },
      ],
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
