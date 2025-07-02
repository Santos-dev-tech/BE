"use client"

import { useClientAuth } from "@/hooks/use-client-auth"
import ClientSignUpForm from "@/components/auth/client-signup-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function ClientSignUpPage() {
  const { clientProfile, loading } = useClientAuth()
  const router = useRouter()

  useEffect(() => {
    if (clientProfile) {
      router.push("/client")
    }
  }, [clientProfile, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (clientProfile) {
    return null // Will redirect
  }

  return <ClientSignUpForm />
}
