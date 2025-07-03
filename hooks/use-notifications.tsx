"use client";

import { useState, useEffect } from "react";

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "BOOKING" | "MESSAGE" | "INFO" | "REMINDER";
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/notifications?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const notificationsData = await response.json();
        setNotifications(notificationsData);
        setUnreadCount(
          notificationsData.filter((n: Notification) => !n.isRead).length,
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const createNotification = async (
    targetUserId: string,
    title: string,
    message: string,
    type: Notification["type"],
    data?: any,
  ) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId: targetUserId,
        title,
        message,
        type,
        read: false,
        createdAt: Timestamp.now(),
        data: data || null,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifications.map((notification) =>
          updateDoc(doc(db, "notifications", notification.id), { read: true }),
        ),
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
  };
}
