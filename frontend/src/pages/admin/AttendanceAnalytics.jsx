import { useState } from "react";
import axios from "../../api/axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AttendanceAnalytics() {
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    setError("");

    const res = await axios.get(
      `/admin/admin/attendance/analytics?start_date=${startDate}&end_date=${endDate}`
    );

    setData(res.data);
  };

  const total =
    (data?.overall.present || 0) +
    (data?.overall.absent || 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Attendance Analytics
      </h2>

      {/* FILTER */}
      <div className="flex gap-3 max-w-md">
        <input
          type="date"
          value={startDate}
          className="bg-gray-800 p-2 rounded"
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          className="bg-gray-800 p-2 rounded"
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          onClick={fetchAnalytics}
          disabled={!startDate || !endDate}
          className={`px-4 rounded ${
            !startDate || !endDate
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-blue-600"
          }`}
        >
          Apply
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {data && (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Kpi label="Present" value={data.overall.present} />
            <Kpi label="Absent" value={data.overall.absent} />
            <Kpi
              label="Avg %"
              value={
                total === 0
                  ? "0%"
                  : Math.round(
                      (data.overall.present / total) * 100
                    ) + "%"
              }
            />
          </div>

          {/* DAILY TREND */}
          <ChartCard title="Daily Attendance Trend">
            <Line
              data={{
                labels: data.daily_attendance.map(
                  (d) => d.date
                ),
                datasets: [
                  {
                    label: "Attendance %",
                    data: data.daily_attendance.map(
                      (d) => d.percentage
                    ),
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59,130,246,0.2)",
                  },
                ],
              }}
            />
          </ChartCard>

          {/* SUBJECT WISE */}
          <ChartCard title="Subject-wise Attendance">
            <Bar
              data={{
                labels: data.subject_wise.map(
                  (s) => s.subject
                ),
                datasets: [
                  {
                    label: "Attendance %",
                    data: data.subject_wise.map(
                      (s) => s.percentage
                    ),
                    backgroundColor: "#22c55e",
                  },
                ],
              }}
            />
          </ChartCard>

          {/* PIE */}
          <ChartCard title="Present vs Absent">
            <Pie
              data={{
                labels: ["Present", "Absent"],
                datasets: [
                  {
                    data: [
                      data.overall.present,
                      data.overall.absent,
                    ],
                    backgroundColor: [
                      "#22c55e",
                      "#ef4444",
                    ],
                  },
                ],
              }}
            />
          </ChartCard>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
      <h3 className="mb-4 text-gray-300">{title}</h3>
      {children}
    </div>
  );
}
