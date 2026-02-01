import { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function AdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/admin/stats").then((res) => {
      setStats(res.data);
    });
  }, []);

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card title="Students" value={stats.students} />
      <Card title="Teachers" value={stats.teachers} />
      <Card title="Admins" value={stats.admins} />
      <Card title="Total Users" value={stats.total_users} />
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
