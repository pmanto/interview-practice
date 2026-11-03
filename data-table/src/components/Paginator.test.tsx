import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Paginator from "./Paginator";

describe("Paginator", () => {
  it("is exposed as a pagination landmark", () => {
    render(<Paginator currentPage={1} totalPages={3} onPageChange={() => {}} />);

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("requests the next and previous pages", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Paginator currentPage={2} totalPages={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Previous" }));

    expect(onPageChange.mock.calls).toEqual([[3], [1]]);
  });

  it.each([
    { currentPage: 1, totalPages: 3, previous: true, next: false },
    { currentPage: 2, totalPages: 3, previous: false, next: false },
    { currentPage: 3, totalPages: 3, previous: false, next: true },
    { currentPage: 1, totalPages: 1, previous: true, next: true },
  ])("page $currentPage of $totalPages: previous disabled=$previous, next disabled=$next", ({ currentPage, totalPages, previous, next }) => {
    render(<Paginator currentPage={currentPage} totalPages={totalPages} onPageChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Previous" }).hasAttribute("disabled")).toBe(previous);
    expect(screen.getByRole("button", { name: "Next" }).hasAttribute("disabled")).toBe(next);
  });
});
