export type UserRole = "admin" | "staff" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export function getUserRole(): UserRole | null {
  // ví dụ: lấy từ localStorage hoặc cookie
  if (typeof window !== "undefined") {
    return (localStorage.getItem("role") as UserRole) || null;
  }
  return null;
}
