"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProgressionDataPoint {
  date: number;
  maxWeight: number;
  estimated1RM: number;
  totalVolume: number;
  sets: number;
  avgReps: number;
}

interface ProgressionChartProps {
  data: ProgressionDataPoint[];
  exerciseName: string;
}

export function ProgressionChart({ data, exerciseName }: ProgressionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No progression data available for {exerciseName}
      </div>
    );
  }

  // Format data for display
  const formattedData = data.map((d) => ({
    displayDate: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    "Max Weight": d.maxWeight,
    "Est. 1RM": d.estimated1RM,
    Volume: Math.round(d.totalVolume / 100) * 100, // Round to nearest 100 for cleaner chart
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="displayDate"
          stroke="#9CA3AF"
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#F3F4F6" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }}
        />
        <Line
          type="monotone"
          dataKey="Max Weight"
          stroke="#60A5FA"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="Est. 1RM"
          stroke="#34D399"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="Volume"
          stroke="#F59E0B"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

