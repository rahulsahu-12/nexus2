import { useEffect, useState } from "react";
import TeacherLayout from "../TeacherLayout";
import api from "../../../api/axios";

export default function AttendanceHistory({ setPage }) {
  const [subjects, setSubjects] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");

  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(false);

  const safeSetPage = setPage || (() => {});

  /* ---------- LOAD SUBJECTS ---------- */
  useEffect(() => {
    api
      .get("/teacher/attendance/subjects")
      .then((res) => setSubjects(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  /* ---------- SUBJECT → AUTO YEAR ---------- */
  const handleSubjectChange = async (value) => {
    setSubject(value);
    setYear("");
    setAvailableYears([]);
    setHistory([]);
    setStudents([]);
    setSelectedDate(null);

    if (!value) return;

    try {
      const res = await api.get(
        `/teacher/attendance/subject-years/${value}`
      );

      if (res.data.length === 1) {
        setYear(String(res.data[0]));
      } else {
        setAvailableYears(res.data.map(String));
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- LOAD SUBJECT HISTORY ---------- */
  const loadHistory = async () => {
    if (!subject || !year) return;

    setLoading(true);
    try {
      const res = await api.get(
        "/teacher/attendance/history/subject",
        { params: { subject, year } }
      );
      setHistory(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- LOAD DATE DETAILS ---------- */
  const loadDateDetails = async (date) => {
    setSelectedDate(date);

    try {
      const res = await api.get(
        "/teacher/attendance/history/date",
        {
          params: {
            subject,
            year,
            attendance_date: date,
          },
        }
      );

      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- EXPORT CSV ---------- */
  const exportCSV = () => {
    if (!selectedDate) return;

    window.open(
      `${api.defaults.baseURL}/teacher/attendance/export/csv?subject=${subject}&year=${year}&attendance_date=${selectedDate}`,
      "_blank"
    );
  };

  return (
    <TeacherLayout setPage={safeSetPage}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#7A5A2E]">
            Attendance History
          </h1>
          <p className="text-sm text-[#8A7A5E] mt-1">
            Review past attendance records and trends
          </p>
        </div>

        <button
          onClick={() => safeSetPage("teacher-attendance")}
          className="
            px-4 py-2 rounded-lg
            border border-[#D9A066]
            text-[#D9A066]
            text-sm font-medium
            hover:bg-[#FBF4EA]
            transition
          "
        >
          ← Back
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow flex gap-3 max-w-xl mb-6">
        <select
          value={subject}
          onChange={(e) => handleSubjectChange(e.target.value)}
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">Year</option>
          {(availableYears.length
            ? availableYears
            : ["1", "2", "3", "4"]
          ).map((y) => (
            <option key={y} value={y}>
              {y} Year
            </option>
          ))}
        </select>

        <button
          onClick={loadHistory}
          className="bg-[#D9A066] text-white px-4 rounded"
        >
          Load
        </button>
      </div>

      {/* SUBJECT HISTORY TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-[#FBF4EA]">
            <tr>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Present</th>
            </tr>
          </thead>
          <tbody>
            {!loading && history.length === 0 && (
              <tr>
                <td
                  colSpan="2"
                  className="text-center py-6 text-[#8A7A5E]"
                >
                  No records found
                </td>
              </tr>
            )}

            {history.map((h, i) => (
              <tr
                key={i}
                className="border-t cursor-pointer hover:bg-[#FFF6E6]"
                onClick={() => loadDateDetails(h.date)}
              >
                <td className="px-4 py-2">
                  {new Date(h.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 font-semibold">
                  {h.present_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DATE DETAILS */}
      {selectedDate && (
        <div className="mt-6 bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">
              {selectedDate} — Present{" "}
              {students.filter((s) => s.status === "present").length}
              / {students.length}
            </h2>

            <button
              onClick={exportCSV}
              className="px-3 py-1 bg-[#7A5A2E] text-white rounded"
            >
              Export CSV
            </button>
          </div>

          <table className="w-full text-sm">
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">{s.name}</td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      s.status === "present"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {s.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </TeacherLayout>
  );
}
