import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchBox from "./SearchBox";

describe("SearchBox", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function type(value: string) {
    fireEvent.change(screen.getByRole("searchbox"), { target: { value } });
  }

  it("has an accessible label", () => {
    render(<SearchBox onSearch={() => {}} />);

    expect(screen.getByRole("searchbox", { name: "Search users by name" })).toBeInTheDocument();
  });

  it("calls onSearch once with the last value after typing stops", () => {
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);

    type("a");
    vi.advanceTimersByTime(200);
    type("al");
    vi.advanceTimersByTime(200);
    type("ali");
    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("ali");
  });

  it("respects a custom delay", () => {
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} delay={1000} />);

    type("bob");
    vi.advanceTimersByTime(999);
    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onSearch).toHaveBeenCalledWith("bob");
  });

  it("cancels a pending search on unmount", () => {
    const onSearch = vi.fn();
    const { unmount } = render(<SearchBox onSearch={onSearch} />);

    type("bob");
    unmount();
    vi.advanceTimersByTime(300);

    expect(onSearch).not.toHaveBeenCalled();
  });
});
