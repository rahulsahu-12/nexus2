import { useEffect, useState } from "react";
import TeacherLayout from "../TeacherLayout";
import api from "../../../api/axios";

export default function ActiveAttendance({ setPage }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    api.get("/teacher/attendance/active")
      .then(res => setSession(res.data))
      .catch(() => alert("No active session"));
  }, []);

  if (!session) {
    return (
      <TeacherLayout setPage={setPage}>
        <p className="text-slate-500">Loading active session...</p>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout setPage={setPage}>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Active Attendance
      </h1>

      <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md shadow-sm space-y-3">
        <p className="text-sm text-slate-600">
          Subject: <b>{session.subject}</b>
        </p>
        <p className="text-sm text-slate-600">
          Session Code:
        </p>

        <div className="text-3xl font-bold text-indigo-600">
          {session.session_code}
        </div>

        <button
          onClick={() => setPage("teacher-attendance-history")}
          className="text-sm text-indigo-600 hover:underline"
        >
          End & View History
        </button>
      </div>
    </TeacherLayout>
  );
}
