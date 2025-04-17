// components/Header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { fetchClient } from "@/utils/fetch-client";
import { LogIn, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const handleLogout = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`;
      const res = await fetchClient(url, {
        method: "POST",
        body: null,
        headers: { "Content-Type": "application/json" },
      }, session);

      if (!res.ok) {
        throw new Error(`Logout failed: ${await res.text()}`);
      }

      console.log("Logout success");
      await signOut({ redirectTo: "/login" });
    } catch (error) {
      console.error("Error logging out:", error);
      await signOut({ redirectTo: "/login" });
    }
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-center">
        <div className="w-full max-w-4xl flex items-center justify-between">
          <div>
            <Link href="/" className="text-xl font-bold">
              숙훌링크
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            {!isLoading && (
              <>
                {session ? (
                  <>
                    <Link href="/users">
                      <Button variant="ghost">사용자</Button>
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
  );
}
