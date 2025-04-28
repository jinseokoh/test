import { RegisterForm } from "@/components/register-form";
import { verifySession } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await verifySession();

  if (session.user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">Enter your information below to create your account</p>
      </div>
      <RegisterForm />
    </div>
  )
}
