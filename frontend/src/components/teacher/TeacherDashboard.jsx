import { useEffect, useState } from "react";
import TeacherLayout from "./TeacherLayout";
import api from "../../api/axios";

const DEFAULT_DATA = {
  attendance: {
    active: false,
    subject: null,
    session_code: null
  },
  assignments: {
    total: 0,
    due_today: 0,
    pending_submissions: 0
  },
  recent_notes: []
};

export default function TeacherDashboard({ setPage }) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/teacher/dashboard")
      .then(res => {
        setData(prev => ({
          ...prev,
          ...res.data,
          attendance: {
            ...prev.attendance,
            ...(res.data?.attendance || {})
          },
          assignments: {
            ...prev.assignments,
            ...(res.data?.assignments || {})
          },
          recent_notes: res.data?.recent_notes || []
        }));
      })
      .catch(err => {
        console.error("Dashboard load failed", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <TeacherLayout setPage={setPage}>
        <div className="h-[60vh] flex items-center justify-center text-[#8E9AAF]">
          Preparing your dashboard…
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout setPage={setPage}>
      <div className="min-h-screen px-2 py-4 md:p-8">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold text-[#6B728E] mb-8">
          Teacher Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ATTENDANCE */}
          <Card title="Attendance">
            {data.attendance.active ? (
              <>
                <Badge text="LIVE" />
                <Row label="Subject" value={data.attendance.subject} />
                <Row label="Code" value={data.attendance.session_code} />
                <Action
                  label="View Attendance"
                  onClick={() => setPage("teacher-active-attendance")}
                />
              </>
            ) : (
              <>
                <p className="text-sm text-[#8E9AAF]">
                  No active attendance session
                </p>
                <Action
                  label="Start Attendance"
                  onClick={() => setPage("teacher-start-attendance")}
                />
              </>
            )}
          </Card>

          {/* ASSIGNMENTS */}
          <Card title="Assignments">
            <Metric label="Total" value={data.assignments.total} />
            <Metric
              label="Due Today"
              value={data.assignments.due_today}
              highlight
            />
            <Metric
              label="Pending"
              value={data.assignments.pending_submissions}
            />
            <Divider />
            <Action
              label="Open Assignments"
              onClick={() => setPage("teacher-assignments")}
            />
          </Card>

          {/* NOTES */}
          <Card title="Notes">
            {data.recent_notes.length === 0 ? (
              <Empty
                title="No notes yet"
                subtitle="Upload notes for students"
              />
            ) : (
              <ul className="space-y-2">
                {data.recent_notes.map(n => (
                  <li
                    key={n.id}
                    className="
                      flex justify-between items-center
                      px-3 py-2 rounded-lg
                      bg-[#F1F3F7]
                      border border-[#E4E7EF]
                    "
                  >
                    <span className="text-sm font-medium text-[#6B728E]">
                      {n.subject}
                    </span>
                    <span className="text-xs text-[#8E9AAF]">
                      Year {n.year}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Divider />
            <Action
              label="Open Notes"
              onClick={() => setPage("teacher-notes")}
            />
          </Card>

        </div>
      </div>
    </TeacherLayout>
  );
}

/* ---------- UI HELPERS ---------- */

function Card({ title, children }) {
  return (
    <div
      className="
        bg-white
        border border-[#E4E7EF]
        rounded-2xl
        shadow-[0_6px_18px_rgba(0,0,0,0.06)]
        p-6 space-y-4
      "
    >
      <h3 className="font-semibold text-[#6B728E]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Metric({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-[#8E9AAF]">
        {label}
      </span>
      <span
        className={`text-lg font-semibold ${
          highlight ? "text-[#5E6AD2]" : "text-[#6B728E]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-[#8E9AAF]">
      <span>{label}</span>
      <span className="font-medium text-[#6B728E]">
        {value ?? "-"}
      </span>
    </div>
  );
}

function Action({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        mt-2 text-sm font-medium
        text-[#5E6AD2]
        hover:text-[#4B55C4]
        transition
      "
    >
      {label} →
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-[#E4E7EF] my-2" />;
}

function Badge({ text }) {
  return (
    <span
      className="
        inline-block text-xs font-semibold
        px-3 py-1 rounded-full
        bg-[#E6E9F2]
        text-[#5E6AD2]
      "
    >
      {text}
    </span>
  );
}

function Empty({ title, subtitle }) {
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-[#6B728E]">{title}</p>
      <p className="text-xs text-[#8E9AAF]">{subtitle}</p>
    </div>
  );
}
