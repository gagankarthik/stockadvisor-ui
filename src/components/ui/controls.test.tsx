import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Segmented, Toggle, Select, Range } from "./index";

describe("Segmented", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ];

  it("marks the selected option with aria-pressed", () => {
    render(<Segmented options={options} value="a" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Alpha" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Beta" })).toHaveAttribute("aria-pressed", "false");
  });

  it("emits the value of a clicked option", async () => {
    const onChange = vi.fn();
    render(<Segmented options={options} value="a" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("Toggle", () => {
  it("exposes switch semantics reflecting checked state", () => {
    render(<Toggle checked label="ML blend" onChange={() => {}} />);
    const sw = screen.getByRole("switch", { name: /ML blend/ });
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("emits the negated value on click", async () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} label="adaptive" onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch", { name: /adaptive/ }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("Select", () => {
  const options: [string, string][] = [
    ["", "Any"],
    ["BUY", "Buy"],
    ["SELL", "Sell"],
  ];

  it("renders every option and reflects the value", () => {
    render(<Select value="BUY" options={options} onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toHaveValue("BUY");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("emits the chosen value", async () => {
    const onChange = vi.fn();
    render(<Select value="" options={options} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "SELL");
    expect(onChange).toHaveBeenCalledWith("SELL");
  });
});

describe("Range", () => {
  it("shows the current value with its suffix", () => {
    render(<Range label="Max volatility" value={40} min={0} max={100} step={5} suffix="%" onChange={() => {}} />);
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("40");
  });

  it("emits a numeric value on change", () => {
    const onChange = vi.fn();
    render(<Range label="Min rating" value={0} min={0} max={100} step={5} suffix="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "25" } });
    expect(onChange).toHaveBeenCalledWith(25);
  });
});
