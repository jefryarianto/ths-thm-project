import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  TrendIndicator,
  calcTrend,
  MiniSparkline,
} from "../trend-indicator";

// ── calcTrend ──

describe("calcTrend", () => {
  it("calculates positive percentage change", () => {
    expect(calcTrend(120, 100)).toBe(20);
  });

  it("calculates negative percentage change", () => {
    expect(calcTrend(80, 100)).toBe(-20);
  });

  it("returns 0 when both values are 0", () => {
    expect(calcTrend(0, 0)).toBe(0);
  });

  it("returns 100 when previous is 0 and current is positive", () => {
    expect(calcTrend(50, 0)).toBe(100);
  });

  it("returns -100 when previous is 0 and current is negative", () => {
    expect(calcTrend(-50, 0)).toBe(-100);
  });

  it("returns 0 when current equals previous", () => {
    expect(calcTrend(100, 100)).toBe(0);
  });

  it("handles decimal values", () => {
    expect(calcTrend(105.5, 100)).toBeCloseTo(5.5, 1);
  });
});

// ── TrendIndicator ──

describe("TrendIndicator", () => {
  it("renders positive trend with up arrow and plus sign", () => {
    const { container } = render(<TrendIndicator value={12.5} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("text-green-600");
    expect(screen.getByText("+12.5%")).toBeInTheDocument();
  });

  it("renders negative trend with down arrow and minus sign", () => {
    const { container } = render(<TrendIndicator value={-8.3} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("text-red-600");
    expect(screen.getByText("-8.3%")).toBeInTheDocument();
  });

  it("renders neutral trend with minus icon", () => {
    const { container } = render(<TrendIndicator value={0} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("text-muted-foreground");
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("renders optional label", () => {
    render(<TrendIndicator value={5} label="vs bulan lalu" />);
    expect(screen.getByText("+5.0%")).toBeInTheDocument();
    expect(screen.getByText("vs bulan lalu")).toBeInTheDocument();
  });

  it("applies compact mode", () => {
    const { container } = render(<TrendIndicator value={10} compact />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("text-[11px]");
  });

  it("inverts colors when invert is true", () => {
    // Positive value with invert → should be red
    const { container: posContainer } = render(
      <TrendIndicator value={10} invert />,
    );
    expect(posContainer.firstChild).toHaveClass("text-red-600");

    // Negative value with invert → should be green
    const { container: negContainer } = render(
      <TrendIndicator value={-10} invert />,
    );
    expect(negContainer.firstChild).toHaveClass("text-green-600");
  });
});

// ── MiniSparkline ──

describe("MiniSparkline", () => {
  it("renders an SVG with bars for data", () => {
    const { container } = render(
      <MiniSparkline data={[10, 20, 30, 40, 50]} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(5);
  });

  it("returns null for empty data", () => {
    const { container } = render(<MiniSparkline data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders single data point", () => {
    const { container } = render(<MiniSparkline data={[42]} />);
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(1);
  });

  it("applies custom className", () => {
    const { container } = render(
      <MiniSparkline data={[1, 2, 3]} className="custom-spark" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-spark");
  });
});
