import { useEffect, useState } from "react";
import TeacherLayout from "../TeacherLayout";
import axios from "../../../api/axios";

export default function MyAssignments({ setPage }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [openAssignment, setOpenAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Reject UI state
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    axios
      .get("/teacher/assignments")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || res.data?.assignments || [];
        setAssignments(data);
      })
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }, []);

  const deleteAssignment = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this assignment?\nThis action cannot be undone."
    );
    if (!confirm) return;

    try {
      setDeletingId(id);
      await axios.delete(`/teacher/assignments/${id}`);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete assignment");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleView = async (assignmentId) => {
    if (openAssignment === assignmentId) {
      setOpenAssignment(null);
      setSubmissions([]);
      return;
    }

    setOpenAssignment(assignmentId);
    setLoadingSubs(true);

    try {
      const res = await axios.get(
        `/teacher/assignments/${assignmentId}/submissions`
      );
      setSubmissions(res.data);
    } catch {
      setSubmissions([]);
    } finally {
      setLoadingSubs(false);
    }
  };

  const approveSubmission = async (submissionId) => {
    try {
      await axios.post(
        `/teacher/assignments/submissions/${submissionId}/approve`
      );
      setSubmissions((prev) =>
        prev.map((s) =>
          s.submission_id === submissionId
            ? { ...s, status: "approved", remarks: null }
            : s
        )
      );
    } catch {
      alert("Failed to approve submission");
    }
  };

  const confirmReject = async (submissionId) => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }

    try {
      const form = new FormData();
      form.append("remarks", rejectReason);

      await axios.post(
        `/teacher/assignments/submissions/${submissionId}/reject`,
        form
      );

      setSubmissions((prev) =>
        prev.map((s) =>
          s.submission_id === submissionId
            ? { ...s, status: "rejected", remarks: rejectReason }
            : s
        )
      );

      setRejectingId(null);
      setRejectReason("");
    } catch {
      alert("Failed to reject submission");
    }
  };

  // ✅ View submission PDF (axios + blob)
  const viewSubmissionPdf = async (submissionId) => {
    try {
      const res = await axios.get(
        `/teacher/assignments/submissions/${submissionId}/file`,
        { responseType: "blob" }
      );

      const pdfBlob = new Blob([res.data], {
        type: "application/pdf"
      });

      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url);
    } catch {
      alert("Failed to open PDF");
    }
  };

  // ✅ EXPORT USING BACKEND (you already had this endpoint)
  const exportSubmissionsFromBackend = async (assignmentId) => {
    try {
      const res = await axios.get(
        `/teacher/assignments/${assignmentId}/submissions/export`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "text/csv;charset=utf-8;"
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `assignment_${assignmentId}_submissions.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Failed to export submissions");
    }
  };

  return (
    <TeacherLayout setPage={setPage}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[#2F4636]">
          My Assignments
        </h1>

        <button
          onClick={() => setPage("teacher-create-assignment")}
          className="px-4 py-2 rounded-xl bg-[#3D5A44] text-white font-medium hover:bg-[#2F4636]"
        >
          + Create Assignment
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading assignments…</p>
      ) : assignments.length === 0 ? (
        <p className="text-slate-500">No assignments created yet.</p>
      ) : (
        <div className="bg-white border border-[#D6E1DA] rounded-2xl overflow-hidden shadow">
          <table className="w-full text-sm">
            <tbody>
              {assignments.map((a) => {
                const isOpen = openAssignment === a.id;

                return (
                  <>
                    <tr
                      key={a.id}
                      className="border-t border-l-2 border-l-[#3D5A44]"
                    >
                      <td className="px-4 py-3 font-medium">
                        {a.title}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleView(a.id)}
                          className="text-[#3D5A44] underline"
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-[#F4F8F6]">
                          <div className="flex justify-between mb-3">
                            <p className="font-medium">
                              Submitted Students
                            </p>
                            <button
                              onClick={() =>
                                exportSubmissionsFromBackend(a.id)
                              }
                              className="text-sm underline text-indigo-600"
                            >
                              Export CSV
                            </button>
                          </div>

                          {loadingSubs ? (
                            <p className="text-sm text-slate-500">
                              Loading submissions…
                            </p>
                          ) : submissions.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              No submissions yet.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {submissions.map((s) => (
                                <div
                                  key={s.submission_id}
                                  className="bg-white border rounded-lg p-4"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">
                                        {s.student_name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        Status: {s.status}
                                      </p>
                                      {s.remarks && (
                                        <p className="text-xs text-red-500 mt-1">
                                          {s.remarks}
                                        </p>
                                      )}
                                    </div>

                                    <button
                                      onClick={() =>
                                        viewSubmissionPdf(
                                          s.submission_id
                                        )
                                      }
                                      className="text-sm underline text-indigo-600"
                                    >
                                      View PDF
                                    </button>
                                  </div>

                                  {s.status === "pending" && (
                                    <>
                                      {rejectingId === s.submission_id ? (
                                        <div className="mt-3 border rounded-lg p-3 bg-gray-50">
                                          <textarea
                                            rows={2}
                                            value={rejectReason}
                                            onChange={(e) =>
                                              setRejectReason(
                                                e.target.value
                                              )
                                            }
                                            placeholder="Enter rejection reason"
                                            className="w-full border rounded px-3 py-2 text-sm"
                                          />

                                          <div className="flex gap-2 mt-2">
                                            <button
                                              onClick={() =>
                                                confirmReject(
                                                  s.submission_id
                                                )
                                              }
                                              className="px-3 py-1 rounded bg-red-600 text-white text-xs"
                                            >
                                              Confirm Reject
                                            </button>
                                            <button
                                              onClick={() =>
                                                setRejectingId(null)
                                              }
                                              className="px-3 py-1 rounded border text-xs"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex gap-2 mt-3">
                                          <button
                                            onClick={() =>
                                              approveSubmission(
                                                s.submission_id
                                              )
                                            }
                                            className="px-3 py-1 rounded bg-green-600 text-white text-xs"
                                          >
                                            Approve
                                          </button>
                                          <button
                                            onClick={() =>
                                              setRejectingId(
                                                s.submission_id
                                              )
                                            }
                                            className="px-3 py-1 rounded bg-red-100 text-red-600 text-xs"
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </TeacherLayout>
  );
}
