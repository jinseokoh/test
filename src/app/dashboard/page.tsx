import { RefreshTokenButton } from '@/components/refresh-token-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { auth } from '../../auth'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  {
    console.log(`🦊 session`, JSON.stringify(session));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-medium">{session.user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium">{session.user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Access Token Expires:</span>
                <span className="font-medium">{new Date(session.accessTokenExpires ?? '').toLocaleTimeString()}</span>
              </div>
            </div>
            <RefreshTokenButton />
            {
              session && <>{
                JSON.stringify(session, null, 2)
              }</>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
