"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check for existing auth token
    const token = localStorage.getItem("auth-token");
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem("user-data") || "{}");
        if (userData.role === "ADMIN" || userData.role === "STYLIST") {
          setUser(userData);
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-data");
      }
    }
    setLoading(false);
  }, [mounted]);

  const loginAdmin = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const { user, token } = await response.json();

    if (user.role !== "ADMIN" && user.role !== "STYLIST") {
      throw new Error("Access denied. Admin or stylist role required.");
    }

    localStorage.setItem("auth-token", token);
    localStorage.setItem("user-data", JSON.stringify(user));
    setUser(user);
    setIsAdmin(true);

    return { user };
  };

  const logout = async () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-data");
    setUser(null);
    setIsAdmin(false);
    router.push("/auth/admin/signin");
  };

  return {
    user,
    isAdmin,
    loading: loading || !mounted,
    loginAdmin,
    logout,
  };
}
