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
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: targetUserId,
          title,
          message,
          type,
          data: data || null,
        }),
      });

      if (response.ok) {
        await fetchNotifications(); // Refresh notifications
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId,
          isRead: true,
        }),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      await Promise.all(
        unreadNotifications.map((notification) =>
          fetch("/api/notifications", {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              notificationId: notification.id,
              isRead: true,
            }),
          }),
        ),
      );

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
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
