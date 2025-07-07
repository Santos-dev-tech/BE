"use client";

import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLoginForm from "@/components/auth/admin-login-form";
import AdminDashboard from "@/components/admin/admin-dashboard";
import { Loader2, Crown } from "lucide-react";

export default function AdminPage() {
  const { isAdmin, loading, user } = useAdminAuth();

  console.log("Admin page render:", {
    isAdmin,
    loading,
    userEmail: user?.email,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Crown className="h-16 w-16 mx-auto mb-4 text-purple-600 animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLoginForm />;
  }

  return <AdminDashboard />;
}
