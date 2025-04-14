import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { LoginForm } from "@/components/login-form"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials below to login to your account</p>
      </div>
      <LoginForm />
    </div>
  )
}
