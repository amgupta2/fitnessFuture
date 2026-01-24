"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VolumeChartProps {
  data: Array<{ date: string; volume: number }>;
}

export function VolumeChart({ data }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No volume data available
      </div>
    );
  }

  // Format date for display (MM/DD)
  const formattedData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
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
          itemStyle={{ color: "#60A5FA" }}
        />
        <Line
          type="monotone"
          dataKey="volume"
          stroke="#60A5FA"
          strokeWidth={2}
          dot={{ fill: "#60A5FA", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

