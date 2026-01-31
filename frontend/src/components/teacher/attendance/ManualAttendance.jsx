import { useEffect, useState } from "react";
import TeacherLayout from "../TeacherLayout";
import api from "../../../api/axios";

export default function ManualAttendance({ setPage }) {
  const [subjects, setSubjects] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const safeSetPage = setPage || (() => {});

  /* ---------- LOAD SUBJECTS ---------- */
  useEffect(() => {
    api
      .get("/teacher/attendance/subjects")
      .then(res => setSubjects(res.data || []))
      .catch(() => setError("Failed to load subjects"));
  }, []);

  /* ---------- SUBJECT → AUTO YEAR ---------- */
  const handleSubjectChange = async (value) => {
    setSubject(value);
    setYear("");
    setDate("");
    setStudents([]);
    setRecords({});
    setError("");

    if (!value) return;

    const res = await api.get(
      `/teacher/attendance/subject-years/${value}`
    );

    if (res.data.length === 1) {
      setYear(String(res.data[0]));
    } else {
      setAvailableYears(res.data.map(String));
    }
  };

  /* ---------- LOAD STUDENTS (WHEN SUBJECT + YEAR + DATE READY) ---------- */
  useEffect(() => {
    if (!subject || !year || !date) return;

    const loadStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/teacher/students`,
          { params: { year } }
        );

        const data = res.data;
        const studentsArray = Array.isArray(data)
          ? data
          : data.students || [];

        setStudents(studentsArray);

        // default all absent
        const initial = {};
        studentsArray.forEach(s => {
          initial[s.id] = "absent";
        });
        setRecords(initial);
      } catch {
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [subject, year, date]);

  /* ---------- SUBMIT ---------- */
  const submitAttendance = async () => {
    if (!subject || !year || !date) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        subject,
        year,
        attendance_date: date,
        records: Object.keys(records).map(id => ({
          student_id: Number(id),
          status: records[id],
        })),
      };

      await api.post("/teacher/attendance/manual", payload);

      alert("Manual attendance saved successfully");
      safeSetPage("teacher-attendance");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout setPage={safeSetPage}>
      <h1 className="text-2xl font-semibold mb-6">Manual Attendance</h1>

      <div className="bg-white border rounded-2xl p-6 max-w-3xl space-y-4 shadow">

        {/* SUBJECT */}
        <select value={subject} onChange={(e) => handleSubjectChange(e.target.value)}>
          <option value="">Select subject</option>
          {subjects.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* YEAR */}
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Select year</option>
          {(availableYears.length ? availableYears : ["1","2","3","4"]).map(y => (
            <option key={y} value={y}>{y} Year</option>
          ))}
        </select>

        {/* DATE */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* STUDENT LIST */}
        {loading && <p className="text-sm">Loading students…</p>}

        {students.length > 0 && (
          <table className="w-full text-sm border">
            <thead>
              <tr>
                <th className="text-left px-3 py-2">Student</th>
                <th className="text-center px-3 py-2">Present</th>
                <th className="text-center px-3 py-2">Absent</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2">{s.name}</td>
                  <td className="text-center">
                    <input
                      type="radio"
                      checked={records[s.id] === "present"}
                      onChange={() =>
                        setRecords({ ...records, [s.id]: "present" })
                      }
                    />
                  </td>
                  <td className="text-center">
                    <input
                      type="radio"
                      checked={records[s.id] === "absent"}
                      onChange={() =>
                        setRecords({ ...records, [s.id]: "absent" })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={submitAttendance}
          disabled={loading || students.length === 0}
          className="w-full py-2 rounded bg-[#D9A066] text-white"
        >
          {loading ? "Saving…" : "Submit Attendance"}
        </button>
      </div>
    </TeacherLayout>
  );
}
