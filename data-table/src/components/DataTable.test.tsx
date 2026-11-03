import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import DataTable from "./DataTable";
import { makeUsers } from "../test/makeUsers";
import type { User } from "../types/User";

function bodyRows() {
  const [, tbody] = screen.getAllByRole("rowgroup");
  return within(tbody).getAllByRole("row");
}

function firstColumn() {
  return bodyRows().map((row) => within(row).getAllByRole("cell")[0].textContent);
}

function header(name: string) {
  return screen.getByRole("columnheader", { name });
}

describe("DataTable", () => {
  describe("pagination", () => {
    it("shows the first 10 users", () => {
      render(<DataTable users={makeUsers(25)} />);

      expect(bodyRows()).toHaveLength(10);
      expect(firstColumn()[0]).toBe("User 01");
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("moves between pages and disables buttons at the edges", async () => {
      const user = userEvent.setup();
      render(<DataTable users={makeUsers(25)} />);
      const previous = screen.getByRole("button", { name: "Previous" });
      const next = screen.getByRole("button", { name: "Next" });

      expect(previous).toBeDisabled();

      await user.click(next);
      expect(firstColumn()[0]).toBe("User 11");

      await user.click(next);
      expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
      expect(bodyRows()).toHaveLength(5);
      expect(next).toBeDisabled();

      await user.click(previous);
      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    });

    it("disables both buttons when there is only one page", () => {
      render(<DataTable users={makeUsers(5)} />);

      expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });
  });

  describe("sorting", () => {
    it("sorts by name ascending by default", () => {
      render(<DataTable users={[...makeUsers(3)].reverse()} />);

      expect(firstColumn()).toEqual(["User 01", "User 02", "User 03"]);
      expect(header("Name")).toHaveAttribute("aria-sort", "ascending");
      expect(header("Email")).toHaveAttribute("aria-sort", "none");
    });

    it("toggles direction when the same column is clicked again", async () => {
      const user = userEvent.setup();
      render(<DataTable users={makeUsers(3)} />);

      await user.click(screen.getByRole("button", { name: "Name" }));

      expect(firstColumn()).toEqual(["User 03", "User 02", "User 01"]);
      expect(header("Name")).toHaveAttribute("aria-sort", "descending");
    });

    it("sorts ascending by a newly selected column", async () => {
      const user = userEvent.setup();
      const users: User[] = [
        { id: "1", name: "Ann", email: "c@example.com", role: "USER", createdAt: "2026-01-01" },
        { id: "2", name: "Ben", email: "a@example.com", role: "USER", createdAt: "2026-01-02" },
        { id: "3", name: "Cat", email: "b@example.com", role: "USER", createdAt: "2026-01-03" },
      ];
      render(<DataTable users={users} />);

      await user.click(screen.getByRole("button", { name: "Email" }));

      expect(firstColumn()).toEqual(["Ben", "Cat", "Ann"]);
      expect(header("Email")).toHaveAttribute("aria-sort", "ascending");
      expect(header("Name")).toHaveAttribute("aria-sort", "none");
    });

    it("goes back to page 1 when the sort changes", async () => {
      const user = userEvent.setup();
      render(<DataTable users={makeUsers(25)} />);

      await user.click(screen.getByRole("button", { name: "Next" }));
      await user.click(screen.getByRole("button", { name: "Name" }));

      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
      expect(firstColumn()[0]).toBe("User 25");
    });

    it("sorts using the keyboard", async () => {
      const user = userEvent.setup();
      render(<DataTable users={makeUsers(3)} />);

      await user.tab(); // search box
      await user.tab(); // Name header
      await user.keyboard("{Enter}");

      expect(header("Name")).toHaveAttribute("aria-sort", "descending");
    });
  });

  describe("search", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    function search(value: string) {
      fireEvent.change(screen.getByRole("searchbox", { name: "Search users by name" }), {
        target: { value },
      });
    }

    it("filters case-insensitively once typing stops", () => {
      vi.useFakeTimers();
      render(<DataTable users={makeUsers(25)} />);

      search("user 2");
      expect(bodyRows()).toHaveLength(10); // not filtered yet

      act(() => vi.advanceTimersByTime(300));

      expect(firstColumn()).toEqual(["User 20", "User 21", "User 22", "User 23", "User 24", "User 25"]);
      expect(screen.getByRole("status")).toHaveTextContent("6 users found");
    });

    it("goes back to page 1 on a new search", () => {
      vi.useFakeTimers();
      render(<DataTable users={makeUsers(25)} />);

      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      search("user");
      act(() => vi.advanceTimersByTime(300));

      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("shows an empty state when nothing matches", () => {
      vi.useFakeTimers();
      render(<DataTable users={makeUsers(25)} />);

      search("nobody");
      act(() => vi.advanceTimersByTime(300));

      expect(screen.getByText("No users found")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("0 users found");
      expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });
  });

  it("updates when users are added", () => {
    const users = makeUsers(10);
    const { rerender } = render(<DataTable users={users} />);
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();

    rerender(<DataTable users={[...users, ...makeUsers(11).slice(10)]} />);

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("11 users found");
  });
});
