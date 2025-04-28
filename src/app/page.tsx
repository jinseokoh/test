import { verifySession } from '@/app/actions/session';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await verifySession();

  if (!session.user) {
    redirect("/login")
  }

  redirect("/dashboard")
}
