import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: "h-4 w-[250px]",
  },
};

export const Text: Story = {
  render: () => (
    <div className="flex w-[300px] flex-col gap-3">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[280px]" />
    </div>
  ),
};

export const Avatar: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-3 w-[100px]" />
      </div>
    </div>
  ),
};

export const CardSkeleton: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <Skeleton className="h-5 w-[150px]" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[60%]" />
      </CardContent>
    </Card>
  ),
};

export const Table: Story = {
  render: () => (
    <div className="w-[400px] space-y-3">
      <div className="flex gap-4">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-6 flex-1" />
          <Skeleton className="h-6 flex-1" />
          <Skeleton className="h-6 flex-1" />
        </div>
      ))}
    </div>
  ),
};

export const DashboardCard: Story = {
  render: () => (
    <div className="grid w-[400px] grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="mb-2 h-3 w-[60px]" />
            <Skeleton className="h-6 w-[80px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

export const CustomClass: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Skeleton className="size-16 rounded-lg" />
      <Skeleton className="h-8 w-32 rounded-full" />
      <Skeleton className="h-12 w-48 rounded-md" />
    </div>
  ),
};
