import React, { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PropTypes from "prop-types";

interface HeavyChartProps {
  data: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
}

const HeavyChart: React.FC<HeavyChartProps> = memo(({ data }) => {
  const chartData = [
    { name: "Open", value: data.byStatus.OPEN || 0, color: "#10B981" },
    {
      name: "In Progress",
      value: data.byStatus.IN_PROGRESS || 0,
      color: "#F59E0B",
    },
    { name: "Resolved", value: data.byStatus.RESOLVED || 0, color: "#3B82F6" },
    { name: "Closed", value: data.byStatus.CLOSED || 0, color: "#6B7280" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Tickets by Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

HeavyChart.displayName = "HeavyChart";

HeavyChart.propTypes = {
  data: PropTypes.shape({
    total: PropTypes.number.isRequired,
    byStatus: PropTypes.object.isRequired,
    byPriority: PropTypes.object.isRequired,
  }).isRequired,
};

export default HeavyChart;
