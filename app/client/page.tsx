"use client"

import { useClientAuth } from "@/hooks/use-client-auth"
import ClientAuthForm from "@/components/auth/client-auth-form"
import ClientDashboard from "@/components/client/client-dashboard"
import { Loader2 } from "lucide-react"

export default function ClientPage() {
  const { clientProfile, loading } = useClientAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!clientProfile) {
    return <ClientAuthForm />
  }

  return <ClientDashboard />
}
