import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Skeleton, ErrorState, EmptyState } from "./index";

describe("ErrorState", () => {
  it("shows the message", () => {
    render(<ErrorState message="Can't reach the API." />);
    expect(screen.getByText("Can't reach the API.")).toBeInTheDocument();
  });

  it("renders a Retry button only when onRetry is provided, and calls it", async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="boom" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("omits the Retry button when no handler is given", () => {
    render(<ErrorState message="boom" />);
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders a contextual title and hint", () => {
    render(<EmptyState title="No saved plans yet" hint="Build one in Allocation." />);
    expect(screen.getByText("No saved plans yet")).toBeInTheDocument();
    expect(screen.getByText("Build one in Allocation.")).toBeInTheDocument();
  });
});

describe("Skeleton", () => {
  it("renders a pulsing placeholder element", () => {
    const { container } = render(<Skeleton className="h-10" />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });
});
