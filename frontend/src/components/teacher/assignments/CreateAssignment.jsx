import { useEffect, useState } from "react";
import TeacherLayout from "../TeacherLayout";
import axios from "../../../api/axios";

export default function CreateAssignment({ setPage }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- LOAD SUBJECTS ---------- */
  useEffect(() => {
    axios
      .get("/teacher/attendance/subjects")
      .then(res => setSubjects(res.data || []))
      .catch(() => setSubjects([]));
  }, []);

  const createAssignment = async () => {
    if (!title || !subject || !year || !dueDate) {
      setError("Title, subject, year and due date are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("year", year);
      formData.append("due_date", dueDate);
      formData.append("description", description);
      if (file) formData.append("file", file);

      await axios.post(
        "/teacher/assignments/create",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setPage("teacher-my-assignments");
    } catch {
      setError("Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout setPage={setPage}>
      <div className="max-w-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-[#2F4636]">
            Create Assignment
          </h1>

          <button
            onClick={() => setPage("teacher-my-assignments")}
            className="
              text-sm font-medium
              text-[#3D5A44]
              hover:underline
            "
          >
            ← Back
          </button>
        </div>

        {/* FORM */}
        <div
          className="
            bg-white
            border border-[#D6E1DA]
            rounded-2xl
            p-6
            space-y-6
            shadow-[0_8px_24px_rgba(0,0,0,0.06)]
          "
        >
          {/* TITLE */}
          <div>
            <h3 className="text-sm font-semibold text-[#3D5A44] mb-1">
              Assignment Title
            </h3>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter assignment title"
              className="
                w-full px-3 py-2 rounded-lg
                border border-[#D6E1DA]
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-[#3D5A44]
              "
            />
          </div>

          {/* SUBJECT & YEAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#3D5A44] mb-1">
                Subject
              </h3>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="
                  w-full px-3 py-2 rounded-lg
                  border border-[#D6E1DA]
                  text-sm
                  focus:outline-none
                  focus:ring-2 focus:ring-[#3D5A44]
                "
              >
                <option value="">Select subject</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#3D5A44] mb-1">
                Year
              </h3>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="
                  w-full px-3 py-2 rounded-lg
                  border border-[#D6E1DA]
                  text-sm
                  focus:outline-none
                  focus:ring-2 focus:ring-[#3D5A44]
                "
              >
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          {/* DUE DATE */}
          <div>
            <h3 className="text-sm font-semibold text-[#3D5A44] mb-1">
              Due Date
            </h3>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="
                w-full px-3 py-2 rounded-lg
                border border-[#D6E1DA]
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-[#3D5A44]
              "
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <h3 className="text-sm font-semibold text-[#3D5A44] mb-1">
              Description
            </h3>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Assignment instructions (optional)"
              className="
                w-full px-3 py-2 rounded-lg
                border border-[#D6E1DA]
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-[#3D5A44]
              "
            />
          </div>

          {/* ATTACHMENT */}
          <div>
            <h3 className="text-sm font-semibold text-[#3D5A44] mb-1">
              Attachment
            </h3>
            <label
              className="
                flex items-center gap-3
                px-4 py-3 rounded-xl
                border border-dashed border-[#3D5A44]
                cursor-pointer
                hover:bg-[#E8EFEA]
                transition
              "
            >
              <span className="text-[#3D5A44] text-lg">📎</span>
              <span className="text-sm text-[#2F4636]">
                {file ? file.name : "Attach file (optional)"}
              </span>
              <input
                type="file"
                onChange={e => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* PUBLISH BUTTON */}
          <button
            onClick={createAssignment}
            disabled={loading}
            className="
              w-full py-2.5 rounded-xl
              bg-[#3D5A44]
              text-white font-semibold
              shadow-[0_6px_16px_rgba(61,90,68,0.4)]
              hover:bg-[#2F4636]
              transition
              disabled:opacity-60
            "
          >
            {loading ? "Publishing…" : "Publish Assignment"}
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
}
