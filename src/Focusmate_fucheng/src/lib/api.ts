export async function fetchOnlineUsers(token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const res = await fetch(`${apiUrl}/online`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("failed");
  return (await res.json()) as { id: string; displayName: string }[];
}


