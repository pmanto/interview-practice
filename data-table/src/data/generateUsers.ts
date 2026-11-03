import type { User } from "../types/User";

const firstNames = ["Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Mallory", "Niaj", "Olivia", "Peggy", "Rupert", "Sybil", "Trent", "Victor", "Walter", "Zoe"];
const lastNames = ["Johnson", "Smith", "Brown", "Garcia", "Miller", "Davis", "Martinez", "Lopez", "Wilson", "Anderson", "Thomas", "Moore", "Jackson", "Lee", "Walker"];

// Fake users for load testing the table
export function generateUsers(count: number): User[] {
  const start = new Date("2020-01-01").getTime();
  const range = Date.now() - start;
  const result: User[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    result[i] = {
      id: `gen-${i}`,
      name: `${first} ${last} ${i}`,
      email: `${first}.${last}.${i}@example.com`.toLowerCase(),
      role: Math.random() < 0.1 ? "ADMIN" : "USER",
      createdAt: new Date(start + Math.random() * range).toISOString().slice(0, 10),
    };
  }
  return result;
}
