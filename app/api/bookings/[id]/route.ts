import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } },
        service: { select: { name: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updateData: any = { status };

    // Handle status-specific updates
    if (status === "IN_PROGRESS") {
      updateData.startTime = new Date();
    } else if (status === "COMPLETED") {
      updateData.endTime = new Date();
      if (booking.startTime) {
        const duration = Math.round(
          (new Date().getTime() - booking.startTime.getTime()) / 60000,
        );
        updateData.duration = duration;
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        stylist: { select: { id: true, name: true } },
        service: { select: { name: true, duration: true } },
      },
    });

    // Create notification for customer
    let notificationMessage = "";
    switch (status) {
      case "CONFIRMED":
        notificationMessage = `Your booking for ${booking.service.name} has been confirmed!`;
        break;
      case "IN_PROGRESS":
        notificationMessage = `Your service has started!`;
        break;
      case "COMPLETED":
        notificationMessage = `Your ${booking.service.name} service has been completed.`;
        break;
      case "CANCELLED":
        notificationMessage = `Your booking for ${booking.service.name} has been cancelled.`;
        break;
    }

    if (notificationMessage) {
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          title: "Booking Update",
          message: notificationMessage,
          type: "BOOKING",
        },
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.booking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 },
    );
  }
}
