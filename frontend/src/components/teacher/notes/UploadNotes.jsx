import React, { useEffect, useState } from "react";
import TeacherLayout from "../TeacherLayout";
import axios from "../../../api/axios";

export default function UploadNotes({ setPage }) {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/notes/teacher/subjects")
      .then(res => setSubjects(res.data))
      .catch(() => alert("Failed to load subjects"));
  }, []);

  const uploadNotes = async () => {
    if (!subject || !year || !file) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("year", year);
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post("/notes/upload", formData);
      setPage("teacher-my-notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout setPage={setPage}>
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => setPage("teacher-notes")}
          className="
            px-3 py-1.5 rounded-md
            border border-[#E2DDC7]
            bg-[#F4F1DE]
            text-sm font-medium
            text-[#5F5B3A]
            hover:bg-[#EFEAD4]
            transition
          "
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold text-[#5F5B3A]">
          Upload Notes
        </h1>
      </div>

      {/* FORM CARD */}
      <div
        className="
          max-w-xl
          bg-[#F4F1DE]
          border border-[#E2DDC7]
          rounded-2xl
          p-8
          shadow-[0_12px_32px_rgba(0,0,0,0.1)]
        "
      >
        {/* SUBJECT */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#5F5B3A] mb-1">
            Subject
          </label>
          <select
            value={subject}
            onChange={(e) => {
              const s = subjects.find(x => x.subject === e.target.value);
              setSubject(s.subject);
              setYear(s.year);
            }}
            className="
              w-full rounded-lg
              border border-[#D8D2B8]
              bg-[#FBF8EC]
              px-3 py-2
              text-sm text-[#5F5B3A]
              focus:outline-none
              focus:ring-2 focus:ring-[#A68A64]
            "
          >
            <option value="">Select subject</option>
            {subjects.map((s, i) => (
              <option key={i} value={s.subject}>
                {s.subject} (Year {s.year})
              </option>
            ))}
          </select>
        </div>

        {/* YEAR */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#5F5B3A] mb-1">
            Year
          </label>
          <input
            value={year}
            disabled
            className="
              w-full rounded-lg
              border border-[#D8D2B8]
              bg-[#EFEAD4]
              px-3 py-2
              text-sm text-[#8B8766]
              cursor-not-allowed
            "
          />
        </div>

        {/* FILE */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#5F5B3A] mb-1">
            Upload File
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="
              block w-full text-sm text-[#5F5B3A]
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg
              file:border-0
              file:bg-[#E6DFC7]
              file:text-[#5F5B3A]
              hover:file:bg-[#DDD5BA]
              transition
            "
          />
        </div>

        {/* ACTION */}
        <button
          onClick={uploadNotes}
          disabled={loading}
          className="
            w-full
            py-2.5 rounded-xl
            bg-[#A68A64]
            text-white text-sm font-semibold
            hover:bg-[#927653]
            transition
            disabled:opacity-60
          "
        >
          {loading ? "Uploading…" : "Upload Notes"}
        </button>
      </div>
    </TeacherLayout>
  );
}
