import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CanvasCharts, type CanvasChartsProps } from "./CanvasCharts";

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => {
  const MockContainer = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockChart = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const MockElement = () => <div />;

  return {
    ResponsiveContainer: MockContainer,
    LineChart: MockChart,
    Line: MockElement,
    BarChart: MockChart,
    Bar: MockElement,
    AreaChart: MockChart,
    Area: MockElement,
    PieChart: MockChart,
    Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Cell: MockElement,
    XAxis: MockElement,
    YAxis: MockElement,
    CartesianGrid: MockElement,
    Tooltip: MockElement,
    Legend: MockElement,
  };
});

const defaultProps: CanvasChartsProps = {
  charts: [
    {
      id: "revenue",
      title: "Revenue",
      type: "line",
      data: [
        { name: "Jan", value: 100000 },
        { name: "Feb", value: 120000 },
        { name: "Mar", value: 115000 },
      ],
    },
    {
      id: "utilization",
      title: "Facility Utilization",
      type: "bar",
      data: [
        { name: "Stage 1", value: 85 },
        { name: "Stage 2", value: 72 },
        { name: "Stage 3", value: 91 },
      ],
    },
  ],
  onChartClick: vi.fn(),
};

describe("CanvasCharts", () => {
  it("renders chart titles", () => {
    render(<CanvasCharts {...defaultProps} />);
    expect(screen.getByText("Revenue")).toBeDefined();
    expect(screen.getByText("Facility Utilization")).toBeDefined();
  });

  it("renders correct number of charts", () => {
    const { container } = render(<CanvasCharts {...defaultProps} />);
    const chartContainers = container.querySelectorAll("[data-chart]");
    expect(chartContainers.length).toBe(2);
  });

  it("renders empty state when no charts", () => {
    render(<CanvasCharts charts={[]} />);
    expect(screen.getByText(/no charts/i)).toBeDefined();
  });

  it("renders companion data table when showTable is true", () => {
    render(<CanvasCharts {...defaultProps} showTable />);
    expect(screen.getByRole("table")).toBeDefined();
  });

  it("renders chart type in data table", () => {
    render(<CanvasCharts {...defaultProps} showTable />);
    expect(screen.getByText("line")).toBeDefined();
    expect(screen.getByText("bar")).toBeDefined();
  });

  it("renders data point counts in table", () => {
    render(<CanvasCharts {...defaultProps} showTable />);
    const cells = screen.getAllByText("3");
    expect(cells.length).toBeGreaterThanOrEqual(2);
  });
});
