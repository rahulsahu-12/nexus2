import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function TeacherList({ setSection, setSelectedTeacher }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/admin/admin/teachers");
      setTeachers(res.data || []);
    } catch (err) {
      console.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-slate-400">Loading teachers...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Teachers</h2>
        <button
          onClick={() => setSection("create-teacher")}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm"
        >
          + Create Teacher
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-slate-800">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Branch</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border-t border-slate-800">
                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.mobile}</td>
                <td className="p-3">{t.branch}</td>
                <td className="p-3">
                  {t.is_active ? "Active" : "Inactive"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => {
                      setSelectedTeacher(t);
                      setSection("teacher-details");
                    }}
                    className="text-indigo-400 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {teachers.length === 0 && (
          <p className="text-slate-400 mt-4">No teachers found.</p>
        )}
      </div>
    </div>
  );
}
