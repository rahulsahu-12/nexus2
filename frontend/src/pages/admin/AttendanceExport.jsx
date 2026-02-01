import { useState } from "react";
import api from "../../api/axios";

export default function AttendanceExport() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const exportData = async () => {
    const res = await api.get(
      `/admin/attendance/export?start_date=${start}&end_date=${end}`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "attendance.xlsx");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 max-w-md">
      <h2 className="text-lg font-semibold mb-4">Export Attendance</h2>

      <input
        type="date"
        className="w-full mb-3 p-2 bg-gray-800 rounded"
        onChange={(e) => setStart(e.target.value)}
      />

      <input
        type="date"
        className="w-full mb-4 p-2 bg-gray-800 rounded"
        onChange={(e) => setEnd(e.target.value)}
      />

      <button
        onClick={exportData}
        className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded"
      >
        Export XLSX
      </button>
    </div>
  );
}
