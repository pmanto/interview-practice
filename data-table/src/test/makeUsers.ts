import type { User } from "../types/User";

// Names are zero-padded so alphabetical order matches numeric order
export function makeUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: `user-${n}`,
      name: `User ${n}`,
      email: `user${n}@example.com`,
      role: i % 2 === 0 ? "ADMIN" : "USER",
      createdAt: `2026-01-${n}`,
    };
  });
}
