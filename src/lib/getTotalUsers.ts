
export async function getTotalUsersClient(): Promise<number> {
  try {
    const res = await fetch("/api/profile/get-all", { cache: "no-store" });
    const data = await res.json();

    if (res.ok && data.users) {
      return data.users.length;
    } else {
      console.error("Error fetching users:", data.error || "Unknown error");
      return 0;
    }
  } catch (err) {
    console.error("Error fetching total users:", err);
    return 0;
  }
}
