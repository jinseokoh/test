"use client"

import { Button } from "@/components/ui/button"
import { LogIn, LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"

export default function Header() {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  const handleLogout = async () => {
    try {
      // Call our API route to handle server-side logout
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      // Then sign out from next-auth
      await signOut({ callbackUrl: "/login" })
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-center">
        <div className="w-full max-w-4xl flex items-center justify-between">
          <div>
            <Link href="/" className="text-xl font-bold">
              Auth App
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            {!isLoading && (
              <>
                {session ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost">Dashboard</Button>
                    </Link>
                    <Button onClick={handleLogout} variant="outline" size="sm">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm">Register</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
