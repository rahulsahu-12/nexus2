import React from "react";
import TeacherLayout from "../TeacherLayout";

export default function TeacherNotes({ setPage }) {
  return (
    <TeacherLayout setPage={setPage}>
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => setPage("teacher-dashboard")}
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
          Notes Management
        </h1>
      </div>

      {/* DOCUMENT TILES */}
      <div
        className="
          grid gap-8
          grid-cols-1 md:grid-cols-2
        "
      >
        {/* UPLOAD NOTES */}
        <div
          onClick={() => setPage("teacher-upload-notes")}
          className="
            cursor-pointer
            bg-[#F4F1DE]
            border border-[#E2DDC7]
            rounded-2xl
            p-8
            shadow-[0_10px_28px_rgba(0,0,0,0.08)]
            hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)]
            transition
          "
        >
          <h2 className="text-xl font-semibold text-[#5F5B3A] mb-3">
            📤 Upload Notes
          </h2>
          <p className="text-sm text-[#8B8766] leading-relaxed">
            Upload PDFs, documents, and reference material for students to
            access anytime.
          </p>
        </div>

        {/* MY NOTES */}
        <div
          onClick={() => setPage("teacher-my-notes")}
          className="
            cursor-pointer
            bg-[#F4F1DE]
            border border-[#E2DDC7]
            rounded-2xl
            p-8
            shadow-[0_10px_28px_rgba(0,0,0,0.08)]
            hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)]
            transition
          "
        >
          <h2 className="text-xl font-semibold text-[#5F5B3A] mb-3">
            📚 My Notes
          </h2>
          <p className="text-sm text-[#8B8766] leading-relaxed">
            View, download, or remove notes you have previously uploaded.
          </p>
        </div>
      </div>
    </TeacherLayout>
  );
}
