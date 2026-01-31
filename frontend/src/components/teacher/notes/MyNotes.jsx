import React, { useEffect, useState } from "react";
import TeacherLayout from "../TeacherLayout";
import axios from "../../../api/axios";

export default function MyNotes({ setPage }) {
  const [notes, setNotes] = useState([]);

  const fetchNotes = async () => {
    const res = await axios.get("/notes/teacher");
    setNotes(res.data);
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note permanently?")) return;
    await axios.delete(`/notes/${id}`);
    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, []);

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
          My Uploaded Notes
        </h1>
      </div>

      {/* NOTES LIST */}
      <div className="space-y-6">
        {notes.length === 0 ? (
          <p className="text-sm text-[#8B8766]">
            No notes uploaded yet.
          </p>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="
                bg-[#F4F1DE]
                border border-[#E2DDC7]
                rounded-2xl
                p-6
                shadow-[0_8px_24px_rgba(0,0,0,0.08)]
                flex justify-between items-start
                hover:shadow-[0_14px_32px_rgba(0,0,0,0.12)]
                transition
              "
            >
              {/* NOTE INFO */}
              <div>
                <h3 className="text-lg font-semibold text-[#5F5B3A]">
                  {n.subject}
                </h3>

                <p className="text-sm text-[#8B8766] mt-1">
                  📄 {n.filename}
                </p>

                <p className="text-xs text-[#9A9678] mt-1">
                  Uploaded on {n.created_at}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    window.open(`/notes/download/teacher/${n.id}`)
                  }
                  className="
                    px-3 py-1.5 rounded-md
                    border border-[#D8D2B8]
                    bg-[#FBF8EC]
                    text-sm font-medium
                    text-[#5F5B3A]
                    hover:bg-[#EFEAD4]
                    transition
                  "
                >
                  Download
                </button>

                <button
                  onClick={() => deleteNote(n.id)}
                  className="
                    px-3 py-1.5 rounded-md
                    border border-[#E6B8B8]
                    bg-[#FDF1F1]
                    text-sm font-medium
                    text-[#9B3A3A]
                    hover:bg-[#F9E3E3]
                    transition
                  "
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </TeacherLayout>
  );
}
