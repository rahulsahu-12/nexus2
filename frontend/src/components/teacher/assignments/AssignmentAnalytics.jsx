import { useEffect, useState } from "react";
import TeacherLayout from "../TeacherLayout";
import axios from "../../../api/axios";

export default function AssignmentAnalytics({ assignmentId, setPage }) {
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    // Load summary
    axios
      .get("/teacher/assignments/analytics/summary")
      .then(res => {
        const found = res.data.find(
          a => String(a.assignment_id) === String(assignmentId)
        );
        setSummary(found || null);
      });

    // Load pending (not submitted)
    axios
      .get(`/teacher/assignments/${assignmentId}/analytics/pending`)
      .then(res => setPending(res.data || []));

    // 🔥 Load submitted students
    axios
      .get(`/teacher/assignments/${assignmentId}/submissions`)
      .then(res => setSubmissions(res.data || []));
  }, [assignmentId]);

  const approve = async (id) => {
    await axios.post(`/teacher/assignments/submissions/${id}/approve`);
    refreshSubmissions();
  };

  const reject = async (id) => {
    const remarks = prompt("Reason for rejection?");
    if (!remarks) return;

    const form = new FormData();
    form.append("remarks", remarks);

    await axios.post(
      `/teacher/assignments/submissions/${id}/reject`,
      form
    );
    refreshSubmissions();
  };

  const refreshSubmissions = () => {
    axios
      .get(`/teacher/assignments/${assignmentId}/submissions`)
      .then(res => setSubmissions(res.data || []));
  };

  if (!summary) {
    return (
      <TeacherLayout setPage={setPage}>
        <p className="text-slate-500">Loading analytics…</p>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout setPage={setPage}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#2F4636]">
            Assignment Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Submission overview and student status
          </p>
        </div>

        <button
          onClick={() => setPage("teacher-my-assignments")}
          className="text-sm font-medium text-[#3D5A44] hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* SUMMARY CARD */}
      <Summary summary={summary} />

      {/* SUBMITTED STUDENTS */}
      <div className="mt-10 max-w-3xl">
        <h3 className="text-sm font-semibold text-[#3D5A44] mb-3">
          Submitted Students
        </h3>

        {submissions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No submissions yet.
          </p>
        ) : (
          <table className="w-full bg-white border rounded-xl">
            <thead className="bg-[#F4F8F6] text-sm text-left">
              <tr>
                <th className="p-3">Student</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.submission_id} className="border-t">
                  <td className="p-3">{s.student_name}</td>

                  <td className="text-sm capitalize">
                    {s.status}
                  </td>

                  <td className="space-x-2">
                    <button
                      onClick={() =>
                        window.open(
                          `/teacher/assignments/submissions/${s.submission_id}/file`,
                          "_blank"
                        )
                      }
                      className="text-xs underline text-blue-600"
                    >
                      View PDF
                    </button>

                    {s.status === "pending" && (
                      <>
                        <button
                          onClick={() => approve(s.submission_id)}
                          className="text-xs text-green-700 underline"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reject(s.submission_id)}
                          className="text-xs text-red-600 underline"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PENDING (NOT SUBMITTED) */}
      <PendingList pending={pending} />
    </TeacherLayout>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Summary({ summary }) {
  return (
    <div className="bg-white border rounded-2xl p-6 max-w-xl">
      <p className="text-sm text-slate-500">Subject</p>
      <p className="font-medium">{summary.subject}</p>

      <p className="text-sm text-slate-500 mt-2">Title</p>
      <p className="font-medium">{summary.title}</p>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <Stat label="Total" value={summary.total_students} />
        <Stat label="Submitted" value={summary.submitted} />
        <Stat label="Pending" value={summary.not_submitted} />
      </div>
    </div>
  );
}

function PendingList({ pending }) {
  return (
    <div className="mt-10 max-w-xl">
      <h3 className="text-sm font-semibold mb-3">Pending Students</h3>
      {pending.length === 0 ? (
        <p className="text-sm text-slate-500">All submitted</p>
      ) : (
        <ul className="bg-white border rounded-xl divide-y">
          {pending.map(s => (
            <li key={s.student_id} className="px-4 py-3 flex justify-between">
              <span>{s.name}</span>
              <span className="text-xs bg-gray-100 px-2 rounded">
                Pending
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center bg-[#E8EFEA] rounded-xl py-4">
      <p className="text-xs uppercase">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
