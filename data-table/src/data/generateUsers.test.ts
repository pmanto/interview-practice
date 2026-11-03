import { describe, expect, it } from "vitest";
import { generateUsers } from "./generateUsers";

describe("generateUsers", () => {
  const users = generateUsers(1000);

  it("creates the requested number of users", () => {
    expect(users).toHaveLength(1000);
  });

  it("gives every user a unique id", () => {
    expect(new Set(users.map((user) => user.id)).size).toBe(1000);
  });

  it("uses valid roles and ISO dates", () => {
    for (const user of users) {
      expect(["ADMIN", "USER"]).toContain(user.role);
      expect(user.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
