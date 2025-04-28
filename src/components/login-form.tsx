"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "@/providers/session-provider"
import { LoginFormData, loginFormSchema } from "@/schemas/login-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

export function LoginForm() {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "MANAGER",
    },
  })

  async function onSubmit(formData: LoginFormData) {
    setFormError(null);
    setIsLoading(true);
    console.log('login form data', formData);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      console.log("Login response status:", response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        const { accessToken, refreshToken, user } = responseData;
        
        console.log(`🟣🟣🟣 원격API 로그인 성공`, accessToken, refreshToken, user);
        
        // Refresh the session context with the latest user data
        await refreshSession();
        
        // Redirect to dashboard
        console.log("Redirecting to dashboard...");
        router.push('/dashboard');
      } else {
        let errorData;
        try {
          errorData = await response.json();
          console.log("Login failed. Error data:", errorData);
        } catch {
          console.log("Failed to parse error response");
          errorData = { message: '로그인에 실패했습니다.' };
        }
        setFormError(errorData.message || '로그인에 실패했습니다.');
      }
    } catch (error: unknown) {
      console.log("Login error:", error);
      setFormError(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="text-red-500 text-sm font-medium">{formError}</div>
          )}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INSTRUCTOR">강사</SelectItem>
                    <SelectItem value="PARENT">부모</SelectItem>
                    <SelectItem value="MANAGER">매니저</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        계정이 없으신가요?{" "}
        <Link href="/register" className="underline">
          회원가입
        </Link>
      </div>
    </div>
  )
}
