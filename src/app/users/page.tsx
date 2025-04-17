import { auth } from "@/auth";
import { fetchClient } from "@/utils/fetch-client";
import { redirect } from "next/navigation";

const UserPage = async () => {
  let users = [];

  const session = await auth();

  try {
    const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      headers: {
        "Content-Type": "application/json",
      },
    }, session);

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();
    users = data || []; // 서버 응답 구조에 따라 조정 (예: { result: [...] })
  } catch (error) {
    console.error("Error while fetching users:", error);
    // fetchClient에서 리프레시 실패 시 "Session expired" 에러 발생
    if (error instanceof Error && error.message?.includes("Session expired")) {
      console.log("Token refresh failed, redirecting to login");
      redirect('/login');
    }
    // JSON 파싱 에러 또는 기타 에러
    redirect(`/error?message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
  }

  return (
    <div className="p-3">
      <h2 className="text-2xl my-2">User Page</h2>
      <div className="flex justify-around">
        <ul>
          <h3 className="text-xl my-2">User List</h3>
          {
            users.map((user: any) => (
              <li key={user.id}>{user?.username} ({user?.role})</li>
            ))

          }
        </ul>
      </div>
    </div>
  )
}

export default UserPage