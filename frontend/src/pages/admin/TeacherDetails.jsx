import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { SUBJECTS } from "../../constants/subjects";

/*
  TEMPORARY RULE:
  - Admin can ONLY move teacher to BCA
  - Branch value is "BCA"
  - No CORE, no degree logic
*/

export default function TeacherDetails({ teacher, setSection }) {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ year: "", subject: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);

  /* ================= LOAD ASSIGNED SUBJECTS ================= */

  const fetchSubjects = useCallback(async () => {
    if (!teacher?.id) return;

    try {
      const res = await api.get(
        `/admin/teachers/${teacher.id}/subjects`
      );
      setSubjects(res.data || []);
    } catch {
      console.error("Failed to load subjects");
    }
  }, [teacher]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  /* ================= ASSIGN SUBJECT ================= */

  const assignSubject = async () => {
    setError("");

    if (!form.subject || !form.year) {
      setError("Year and subject are required");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        `/admin/teachers/${teacher.id}/subjects`,
        {
          subject: form.subject,
          year: Number(form.year)
        }
      );

      setForm({ year: "", subject: "" });
      fetchSubjects();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to assign subject"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE SUBJECT ================= */

  const deleteSubject = async (subjectId) => {
    if (!window.confirm("Delete this subject assignment?")) return;

    try {
      await api.delete(
        `/admin/teachers/subjects/${subjectId}`
      );
      fetchSubjects();
    } catch {
      alert("Failed to delete subject");
    }
  };

  /* ================= CHANGE BRANCH → BCA ================= */

  const changeBranch = async () => {
    if (teacher.branch === "BCA") {
      alert("Teacher is already in BCA");
      return;
    }

    const ok = window.confirm(
      "⚠ This will move the teacher to BCA and REMOVE all assigned subjects.\n\nContinue?"
    );
    if (!ok) return;

    try {
      setBranchLoading(true);

      await api.put(
        `/admin/teachers/${teacher.id}/branch`,
        null,
        { params: { branch: "BCA" } }
      );

      alert("Teacher moved to BCA. Reassign subjects.");
      setSection("teachers");
    } catch {
      alert("Failed to change branch");
    } finally {
      setBranchLoading(false);
    }
  };

  if (!teacher) return null;

  /* ================= SUBJECT OPTIONS ================= */

  const yearNumber = Number(form.year);
  const availableSubjects =
    SUBJECTS?.BCA?.BCA?.[yearNumber] || [];

  return (
    <div className="max-w-3xl space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          {teacher.name}
        </h2>
        <button
          onClick={() => setSection("teachers")}
          className="text-slate-400 hover:underline text-sm"
        >
          ← Back
        </button>
      </div>

      {/* TEACHER INFO */}
      <div className="bg-slate-900 p-4 rounded border border-slate-800 space-y-1">
        <p><span className="text-slate-400">Mobile:</span> {teacher.mobile}</p>
        <p><span className="text-slate-400">Branch:</span> {teacher.branch}</p>
      </div>

      {/* CHANGE BRANCH */}
      <div className="bg-indigo-950 p-4 rounded border border-indigo-800 space-y-3">
        <h3 className="font-semibold text-indigo-300">
          Move Teacher to BCA
        </h3>

        <p className="text-sm text-indigo-400">
          This action moves the teacher to <b>BCA</b> and clears all assigned subjects.
        </p>

        <select className="input" disabled value="BCA">
          <option value="BCA">BCA</option>
        </select>

        <button
          onClick={changeBranch}
          disabled={branchLoading}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {branchLoading ? "Updating..." : "Move to BCA"}
        </button>
      </div>

      {/* ASSIGNED SUBJECTS */}
      <div className="bg-slate-900 p-4 rounded border border-slate-800">
        <h3 className="font-semibold mb-3">Assigned Subjects</h3>

        {subjects.length === 0 ? (
          <p className="text-slate-400 text-sm">No subjects assigned</p>
        ) : (
          <ul className="space-y-2">
            {subjects.map((s) => (
              <li
                key={s.id}
                className="flex justify-between items-center bg-slate-800 px-3 py-2 rounded"
              >
                <span>{s.subject} – Year {s.year}</span>
                <button
                  onClick={() => deleteSubject(s.id)}
                  className="text-red-400 text-xs hover:text-red-500"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ASSIGN SUBJECT */}
      <div className="bg-slate-900 p-4 rounded border border-slate-800 space-y-3">
        <h3 className="font-semibold">Assign New Subject</h3>

        <select
          className="input"
          value={form.year}
          onChange={(e) =>
            setForm({ year: e.target.value, subject: "" })
          }
        >
          <option value="">Select Year</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>

        <select
          className="input"
          value={form.subject}
          disabled={!form.year}
          onChange={(e) =>
            setForm({ ...form, subject: e.target.value })
          }
        >
          <option value="">
            {form.year ? "Select Subject" : "Select year first"}
          </option>

          {availableSubjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          onClick={assignSubject}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {loading ? "Assigning..." : "Assign Subject"}
        </button>
      </div>
    </div>
  );
}
