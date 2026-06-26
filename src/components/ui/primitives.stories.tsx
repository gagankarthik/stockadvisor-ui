import type { Meta, StoryObj } from "@storybook/react-vite";
import { Panel, PanelHeader, Stat, Badge, ScoreBar, PageHeader } from "./index";

const meta: Meta = {
  title: "UI/Primitives",
};
export default meta;

type Story = StoryObj;

export const PanelWithHeader: Story = {
  name: "Panel",
  render: () => (
    <Panel className="max-w-md">
      <PanelHeader eyebrow="Market breadth" title="How much is participating" />
      <p className="text-sm text-mute">Panels are the machined surface every section sits in.</p>
    </Panel>
  ),
};

export const Stats: Story = {
  render: () => (
    <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Rating" accent="brass" value="88" sub="overall grade" />
      <Stat label="AI Odds" accent="ion" value="63%" sub="beats market" />
      <Stat label="A bad month" tone="text-down" value="-$420" sub="5th pct" />
      <Stat label="A good month" tone="text-up" value="+$610" sub="95th pct" />
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge fg="text-up" bg="bg-up/10" bd="border-up/40">BUY</Badge>
      <Badge fg="text-mute" bg="bg-mute/5" bd="border-line-2">HOLD</Badge>
      <Badge fg="text-down" bg="bg-down/10" bd="border-down/40">SELL</Badge>
      <Badge>NEUTRAL</Badge>
    </div>
  ),
};

export const ScoreBars: Story = {
  render: () => (
    <div className="flex max-w-xs flex-col gap-3">
      <ScoreBar value={88} />
      <ScoreBar value={52} color="ion" />
      <ScoreBar value={null} />
    </div>
  ),
};

export const PageHeaderExample: Story = {
  name: "PageHeader",
  render: () => (
    <PageHeader
      kicker="Screener"
      title="Scored universe"
      lead="Every stock graded by the adaptive factor score, the ML model, and technical signals."
    />
  ),
};
