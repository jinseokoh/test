import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { verifySession } from '@/app/actions/session';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await verifySession();

  if (!session.user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6 w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to {session.user.username} dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-medium">{session.user.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Management</CardTitle>
            <CardDescription>Manage your authentication tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
            {
              session.user && <div className="overflow-auto max-h-60">
                <pre className="text-xs">{JSON.stringify(session.user, null, 2)}</pre>
              </div>
            }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
