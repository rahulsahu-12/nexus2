import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import SubmitAssignmentModal from "./SubmitAssignmentModal";

const API_BASE = "http://127.0.0.1:8000";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  const fetchAssignments = async () => {
    try {
      const res = await api.get(
        `/student/assignments/?token=${token}`
      );
      setAssignments(res.data);
    } catch (err) {
      alert("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <p className="text-[#6B7280] text-sm">
        Loading assignments...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#1A2233]">
        Assignments
      </h2>

      {assignments.length === 0 && (
        <p className="text-[#6B7280]">
          No assignments available
        </p>
      )}

      {assignments.map((a) => {
        const status = a.status || "not_submitted";

        const isOverdue =
          a.due_date &&
          new Date(a.due_date) < new Date() &&
          status === "not_submitted";

        return (
          <div
            key={a.assignment_id}
            className="bg-white border border-[#E9ECEF] rounded-2xl p-5 md:p-6 shadow-sm"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-[#1A2233]">
                  {a.title}
                </h3>
                <p className="text-sm text-[#6B7280]">
                  Subject: {a.subject}
                </p>
                <p className="text-sm text-[#6B7280]">
                  Due: {a.due_date || "—"}
                </p>
              </div>

              <StatusBadge
                status={status}
                isOverdue={isOverdue}
              />
            </div>

            {/* Description */}
            <p className="mt-3 text-sm text-[#4A4E69]">
              {a.description || "No description"}
            </p>

            {/* Links */}
            <div className="mt-4 space-y-2">
              {a.assignment_file && (
                <button
                  onClick={() =>
                    window.open(
                      `${API_BASE}/student/assignments/${a.assignment_id}/file?token=${token}`,
                      "_blank"
                    )
                  }
                  className="block text-sm font-medium text-[#4895EF] hover:underline"
                >
                  Download Assignment File
                </button>
              )}

              {status !== "not_submitted" && (
                <button
                  onClick={() =>
                    window.open(
                      `${API_BASE}/student/assignments/${a.assignment_id}/submission/file?token=${token}`,
                      "_blank"
                    )
                  }
                  className="block text-sm text-[#6B7280] hover:underline"
                >
                  View My Submission
                </button>
              )}
            </div>

            {/* Actions */}
            {(status === "not_submitted" ||
              status === "rejected") &&
              !isOverdue && (
                <button
                  onClick={() => setSelected(a)}
                  className="mt-5 w-full md:w-auto bg-[#4895EF] hover:bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  {status === "rejected"
                    ? "Re-submit Assignment"
                    : "Submit Assignment"}
                </button>
              )}

            {status === "pending" && (
              <p className="mt-5 text-sm font-medium text-[#E09F3E]">
                Waiting for teacher review
              </p>
            )}

            {status === "approved" && (
              <p className="mt-5 text-sm font-medium text-[#2D6A4F]">
                Submitted ✔ (Approved)
              </p>
            )}

            {status === "rejected" && (
              <p className="mt-5 text-sm text-[#9E3F3F]">
                Rejected: {a.remarks || "Please re-upload"}
              </p>
            )}

            {isOverdue && (
              <p className="mt-5 text-sm text-[#9E3F3F]">
                Submission deadline passed
              </p>
            )}
          </div>
        );
      })}

      {selected && (
        <SubmitAssignmentModal
          assignment={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => {
            setSelected(null);
            fetchAssignments();
          }}
        />
      )}
    </div>
  );
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status, isOverdue }) {
  if (status === "approved") {
    return (
      <span className="self-start md:self-auto px-3 py-1 rounded-full text-xs font-medium bg-[#2D6A4F]/10 text-[#2D6A4F]">
        Submitted
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="self-start md:self-auto px-3 py-1 rounded-full text-xs font-medium bg-[#E09F3E]/15 text-[#E09F3E]">
        Pending
      </span>
    );
  }

  if (status === "rejected" || isOverdue) {
    return (
      <span className="self-start md:self-auto px-3 py-1 rounded-full text-xs font-medium bg-[#9E3F3F]/15 text-[#9E3F3F]">
        {isOverdue ? "Overdue" : "Rejected"}
      </span>
    );
  }

  return (
    <span className="self-start md:self-auto px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-[#6B7280]">
      Not Submitted
    </span>
  );
}
