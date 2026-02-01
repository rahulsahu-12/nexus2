import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Download, ArrowUpCircle, Undo2 } from "lucide-react";

const BRANCHES = ["BCA", "BBA", "BSC", "BTECH"];

const YEARS_BY_BRANCH = {
  BCA: ["1st", "2nd", "3rd"],
  BBA: ["1st", "2nd", "3rd"],
  BSC: ["1st", "2nd", "3rd"],
  BTECH: ["1st", "2nd", "3rd", "4th"]
};

export default function BranchUsers() {
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const fetchData = async () => {
    if (!branch) return;

    const normalizedYear = year ? parseInt(year) : "";
    const params = normalizedYear ? `?year=${normalizedYear}` : "";

    const res = await api.get(`/admin/branch/${branch}${params}`);
    setStudents(res.data.students || []);
    setTeachers(res.data.teachers || []);
  };

  useEffect(() => {
    fetchData();
  }, [branch, year]);

  const promote = async (id) => {
    if (!window.confirm("Promote student to teacher?")) return;
    await api.put(`/admin/promote/${id}`);
    fetchData();
  };

  const undoPromotion = async (id) => {
    if (!window.confirm("Undo promotion and convert back to student?")) return;
    await api.put(`/admin/demote/${id}`);
    fetchData();
  };

  const exportExcel = async () => {
    const params = year ? `?year=${year}` : "";
    const res = await api.get(
      `/admin/branch/${branch}/export${params}`,
      { responseType: "blob" }
    );

    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${branch}_${year || "all"}_users.xlsx`;
    document.body.appendChild(a);
    a.click();

    // ✅ missing but critical
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold text-indigo-400">Branch Users</h2>
        {branch && (
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded-lg"
          >
            <Download size={16} /> Export
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <select
          value={branch}
          onChange={(e) => {
            setBranch(e.target.value);
            setYear("");
          }}
          className="bg-slate-800 px-4 py-2 rounded-lg"
        >
          <option value="">Select Branch</option>
          {BRANCHES.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled={!branch}
          className="bg-slate-800 px-4 py-2 rounded-lg"
        >
          <option value="">All Years</option>
          {branch &&
            YEARS_BY_BRANCH[branch].map((y) => (
              <option key={y}>{y}</option>
            ))}
        </select>
      </div>

      {branch && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-800 p-4 rounded-xl">
            <h3 className="text-green-400 mb-2">Students</h3>
            {students.map((s) => (
              <div key={s.id} className="flex justify-between py-1">
                <span>{s.name}</span>
                <button
                  onClick={() => promote(s.id)}
                  className="text-indigo-400 flex gap-1"
                >
                  <ArrowUpCircle size={16} /> Promote
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 p-4 rounded-xl">
            <h3 className="text-blue-400 mb-2">Teachers</h3>
            {teachers.map((t) => (
              <div key={t.id} className="flex justify-between py-1">
                <span>{t.name}</span>
                <button
                  onClick={() => undoPromotion(t.id)}
                  className="text-red-400 flex gap-1"
                >
                  <Undo2 size={16} /> Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
