'use client';

import { useSession } from '@/providers/session-provider';
import { User } from '@/types/auth';
import { useState } from 'react';

export default function UserList({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const { session } = useSession();
  const [users, setUsers] = useState<User[]>(initialUsers);

  console.log('🟡 users', initialUsers);

  // Function to fetch updated users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <ul>
      <h3 className="text-xl my-2">User List</h3>
      {users.map((user) => (
        <li key={user.id}>
          {user.username} ({user.email || 'N/A'})
        </li>
      ))}
      <div className="mt-4">
        <button
          onClick={fetchUsers}
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Refresh Users
        </button>
      </div>
    </ul>
  );
}