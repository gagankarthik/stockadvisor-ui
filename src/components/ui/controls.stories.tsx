import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Segmented, Toggle, Select, Range } from "./index";
import { PROFILE_SEGMENTS } from "@/lib/constants";

const meta: Meta = {
  title: "UI/Controls",
};
export default meta;

type Story = StoryObj;

export const SegmentedControl: Story = {
  name: "Segmented",
  render: () => {
    const [value, setValue] = useState("Balanced");
    return <Segmented options={PROFILE_SEGMENTS} value={value} onChange={setValue} />;
  },
};

export const SegmentedSmall: Story = {
  name: "Segmented · sm",
  render: () => {
    const [value, setValue] = useState("a");
    return (
      <Segmented
        size="sm"
        value={value}
        onChange={setValue}
        options={[
          { value: "a", label: "Candles" },
          { value: "b", label: "Area" },
        ]}
      />
    );
  },
};

export const ToggleSwitch: Story = {
  name: "Toggle",
  render: () => {
    const [on, setOn] = useState(true);
    return <Toggle checked={on} onChange={setOn} label="ML blend" />;
  },
};

export const SelectMenu: Story = {
  name: "Select",
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-56">
        <Select
          value={value}
          onChange={setValue}
          options={[
            ["", "Any signal"],
            ["BUY", "Buy"],
            ["HOLD", "Hold"],
            ["SELL", "Sell"],
          ]}
        />
      </div>
    );
  },
};

export const RangeSlider: Story = {
  name: "Range",
  render: () => {
    const [v, setV] = useState(40);
    return (
      <div className="w-64">
        <Range label="Max volatility" value={v} min={5} max={100} step={5} suffix="%" onChange={setV} />
      </div>
    );
  },
};
