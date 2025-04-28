// components/Header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/providers/session-provider";
import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Header() {
  const { session, logout, isAuthenticated, refreshSession } = useSession();
  
  // Refresh session once when component mounts
  useEffect(() => {
    refreshSession();
  }, []); // 빈 의존성 배열은 컴포넌트가 마운트될 때 한 번만 실행됨

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
            {isAuthenticated ? (
              <>
                <Link href="/users">
                  <Button variant="ghost">사용자</Button>
                </Link>
                <span className="text-sm mr-2">
                  {session.user?.username || 'User'}
                </span>
                <Button onClick={logout} variant="outline" size="sm">
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
          </nav>
        </div>
      </div>
    </header>
  );
}
