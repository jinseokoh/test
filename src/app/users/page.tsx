import { verifySession } from '@/app/actions/session';
import UserList from '@/components/user-list';
import { Session } from '@/types/auth';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const session: Session = await verifySession();

  if (!session.user) {
    redirect('/login');
  }

  let users = [];
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    users = await response.json() || [];

    console.log('🟡 users', users);

  } catch (error) {
    console.error('Error while fetching users:', error);
    if (error instanceof Error && error.message.includes('Session expired')) {
      console.log('Token refresh failed, redirecting to login');
      redirect('/login');
    }
    redirect(`/error?message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
  }

  return (
    <div className="p-3">
      <h2 className="text-2xl my-2">User Page</h2>
      <div className="flex justify-around">
        <UserList initialUsers={users} />
      </div>
    </div>
  );
}