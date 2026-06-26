import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreBar, Badge, Stat, PanelHeader, PageHeader } from "./index";

describe("ScoreBar", () => {
  it("renders an em-dash readout for a null value", () => {
    render(<ScoreBar value={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("rounds the numeric readout", () => {
    render(<ScoreBar value={72.6} />);
    expect(screen.getByText("73")).toBeInTheDocument();
  });

  it("clamps out-of-range values to 100 in the readout", () => {
    render(<ScoreBar value={250} />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });
});

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>VERIFIED</Badge>);
    expect(screen.getByText("VERIFIED")).toBeInTheDocument();
  });
});

describe("Stat", () => {
  it("renders label, value and sub", () => {
    render(<Stat label="Rating" value="88" sub="overall grade" />);
    expect(screen.getByText("Rating")).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText("overall grade")).toBeInTheDocument();
  });
});

describe("PanelHeader / PageHeader", () => {
  it("PanelHeader surfaces eyebrow + title", () => {
    render(<PanelHeader eyebrow="Market breadth" title="Participation" />);
    expect(screen.getByText("Market breadth")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Participation" })).toBeInTheDocument();
  });

  it("PageHeader renders the H1 title and optional lead", () => {
    render(<PageHeader kicker="Screener" title="Scored universe" lead="Every stock graded." />);
    expect(screen.getByRole("heading", { level: 1, name: "Scored universe" })).toBeInTheDocument();
    expect(screen.getByText("Every stock graded.")).toBeInTheDocument();
  });
});
