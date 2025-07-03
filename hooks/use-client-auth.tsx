"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ClientProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  uid: string;
  displayName: string;
}

export function useClientAuth() {
  const [user, setUser] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
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
        if (userData.role === "CLIENT") {
          const clientData = {
            id: userData.id,
            email: userData.email,
            name: userData.name || "",
            phone: userData.phone,
            role: userData.role,
            uid: userData.id, // for compatibility
            displayName: userData.name || userData.email,
          };
          setUser(userData);
          setClientProfile(clientData);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-data");
      }
    }
    setLoading(false);
  }, [mounted]);

  const registerClient = async (
    email: string,
    password: string,
    displayName: string,
    phone: string,
  ) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name: displayName,
        phone,
        role: "CLIENT",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const userData = await response.json();

    // Auto sign in after registration
    await loginClient(email, password);

    return { user: userData };
  };

  const loginClient = async (email: string, password: string) => {
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

    if (user.role !== "CLIENT") {
      throw new Error("Access denied. Client role required.");
    }

    localStorage.setItem("auth-token", token);
    localStorage.setItem("user-data", JSON.stringify(user));

    const clientData = {
      id: user.id,
      email: user.email,
      name: user.name || "",
      phone: user.phone,
      role: user.role,
      uid: user.id, // for compatibility
      displayName: user.name || user.email,
    };

    setUser(user);
    setClientProfile(clientData);

    return { user };
  };

  const logout = async () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-data");
    setUser(null);
    setClientProfile(null);
    router.push("/auth/client/signin");
  };

  return {
    user,
    clientProfile,
    loading: loading || !mounted,
    registerClient,
    loginClient,
    logout,
  };
}
