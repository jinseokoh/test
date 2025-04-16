"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"

export function RefreshTokenButton() {
  const { data: session, update } = useSession()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!session) return

    setIsRefreshing(true)

    try {
      const url = `/api/auth/refresh`;
      // const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;
      const refreshToken = session.refreshToken;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
        // credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to refresh token")
      }

      // Update the session with the new token
      await update({
        ...session,
        accessToken: data.accessToken,
        expiresAt: data.expiresAt,
      })

      toast.success("Token refreshed", {
        description: "Your access token has been refreshed successfully",
      })
    } catch (error) {
      toast.error("Refresh failed", {
        description: "Failed to refresh your access token",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" className="w-full">
      <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh Token"}
    </Button>
  )
}
