import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton, ErrorState, EmptyState } from "./index";

const meta: Meta = {
  title: "UI/States",
};
export default meta;

type Story = StoryObj;

export const Loading: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-4 lg:grid-cols-3">
      <Skeleton className="h-40 lg:col-span-2" />
      <Skeleton className="h-40" />
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="max-w-md">
      <ErrorState
        message="Can't reach the API. Check the backend is running and the base URL is right."
        onRetry={() => {}}
      />
    </div>
  ),
};

export const EmptyFresh: Story = {
  name: "Empty · fresh",
  render: () => (
    <div className="max-w-md">
      <EmptyState title="No saved plans yet" hint="Build one in Allocation and hit Save to start tracking it." />
    </div>
  ),
};

export const EmptyFiltered: Story = {
  name: "Empty · filtered",
  render: () => (
    <div className="max-w-md">
      <EmptyState title="Nothing matches" hint="Loosen a filter or reset." />
    </div>
  ),
};
