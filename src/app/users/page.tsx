import { fetchClient } from "@/utils/fetch-client";
import { redirect } from "next/navigation";

const UserPage = async () => {
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
  console.log("🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢session:", session);
  const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    if (res.status === 403) {
      console.log("Token Expired");
      redirect('/login');
    }
  }

  const text = await res.text();
  let users = [];
  try {
    users = JSON.parse(text);
  } catch (err) {
    console.error("JSON 파싱 실패!", err);
  }

  console.log(users);

  return (
    <div className="p-3">
      <h2 className="text-2xl my-2">User Page</h2>
      <div className="flex justify-around">
        <ul>
          <h3 className="text-xl my-2">User List</h3>
          {
            users.map((user: any) => (
              <li key={user.id}>{user?.username}({user?.role})</li>
            ))

          }
        </ul>
      </div>
    </div>
  )
}

export default UserPage