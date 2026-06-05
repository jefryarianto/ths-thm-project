import type { Meta, StoryObj } from "@storybook/react";
import { TrendIndicator, MiniSparkline } from "./trend-indicator";

const meta: Meta<typeof TrendIndicator> = {
  title: "UI/TrendIndicator",
  component: TrendIndicator,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "number", min: -100, max: 100, step: 0.1 },
      description: "Persentase perubahan",
    },
    label: {
      control: "text",
      description: "Label opsional (misal: vs bulan lalu)",
    },
    compact: {
      control: "boolean",
      description: "Mode ringkas (ukuran teks lebih kecil)",
    },
    invert: {
      control: "boolean",
      description: "Balik warna (positif=merah, negatif=hijau)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrendIndicator>;

export const Positive: Story = {
  args: { value: 15.3, label: "vs bulan lalu" },
};

export const Negative: Story = {
  args: { value: -8.2 },
};

export const Neutral: Story = {
  args: { value: 0 },
};

export const Compact: Story = {
  args: { value: 5.5, compact: true },
};

export const InvertedPositive: Story = {
  args: { value: 12, invert: true },
  name: "Invert — Positif (Merah)",
};

export const InvertedNegative: Story = {
  args: { value: -12, invert: true },
  name: "Invert — Negatif (Hijau)",
};

export const WithLabel: Story = {
  args: { value: 3.2, label: "dari bulan sebelumnya" },
};

export const DoubleDigit: Story = {
  args: { value: 99.9, label: "pertumbuhan" },
};

// ── MiniSparkline Stories ──

const sparklineMeta: Meta<typeof MiniSparkline> = {
  title: "UI/MiniSparkline",
  component: MiniSparkline,
  tags: ["autodocs"],
  argTypes: {
    data: {
      control: "object",
      description: "Array nilai numerik untuk batang",
    },
    className: {
      control: "text",
      description: "Class Tailwind tambahan",
    },
  },
};

export const FiveBars: StoryObj<typeof MiniSparkline> = {
  name: "5 Data Points",
  render: () => (
    <MiniSparkline data={[3200000, 3450000, 3100000, 3680000, 3750000]} />
  ),
};

export const ThreeBars: StoryObj<typeof MiniSparkline> = {
  name: "3 Data Points",
  render: () => <MiniSparkline data={[10, 20, 15]} />,
};

export const SingleBar: StoryObj<typeof MiniSparkline> = {
  name: "Single Data Point",
  render: () => <MiniSparkline data={[42]} />,
};

export const Empty: StoryObj<typeof MiniSparkline> = {
  name: "Empty (No Data)",
  render: () => <MiniSparkline data={[]} />,
};

export const Increasing: StoryObj<typeof MiniSparkline> = {
  name: "Increasing Trend",
  render: () => <MiniSparkline data={[5, 15, 25, 40, 65, 100]} />,
};

export const Decreasing: StoryObj<typeof MiniSparkline> = {
  name: "Decreasing Trend",
  render: () => <MiniSparkline data={[100, 65, 40, 25, 15, 5]} />,
};

export const Colored: StoryObj<typeof MiniSparkline> = {
  name: "With Custom Color",
  render: () => (
    <MiniSparkline
      data={[10, 20, 15, 30, 25]}
      className="text-blue-500"
    />
  ),
};
