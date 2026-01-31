import TeacherLayout from "../TeacherLayout";

export default function TeacherAttendance({ setPage }) {
  return (
    <TeacherLayout setPage={setPage}>
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#7A5A2E]">
          Attendance
        </h1>
        <p className="text-sm text-[#8A7A5E] mt-1">
          Manage and track class attendance
        </p>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* START ATTENDANCE */}
        <div
          className="
            bg-white
            border border-[#EAD9BE]
            rounded-2xl
            p-6
            shadow-[0_6px_18px_rgba(0,0,0,0.06)]
          "
        >
          <h3 className="text-lg font-semibold text-[#7A5A2E] mb-2">
            Start Attendance
          </h3>
          <p className="text-sm text-[#8A7A5E] mb-4">
            Start a new attendance session for your class.
          </p>

          <button
            onClick={() => setPage("teacher-start-attendance")}
            className="
              text-sm font-medium
              text-[#B8894F]
              hover:text-[#7A5A2E]
              transition
            "
          >
            Start Attendance →
          </button>
        </div>

        {/* ATTENDANCE HISTORY */}
        <div
          className="
            bg-white
            border border-[#EAD9BE]
            rounded-2xl
            p-6
            shadow-[0_6px_18px_rgba(0,0,0,0.06)]
          "
        >
          <h3 className="text-lg font-semibold text-[#7A5A2E] mb-2">
            Attendance History
          </h3>
          <p className="text-sm text-[#8A7A5E] mb-4">
            View previous attendance records and summaries.
          </p>

          <button
            onClick={() => setPage("teacher-attendance-history")}
            className="
              text-sm font-medium
              text-[#B8894F]
              hover:text-[#7A5A2E]
              transition
            "
          >
            View History →
          </button>
        </div>

        {/* MANUAL ATTENDANCE */}
        <div
          className="
            bg-white
            border border-[#EAD9BE]
            rounded-2xl
            p-6
            shadow-[0_6px_18px_rgba(0,0,0,0.06)]
          "
        >
          <h3 className="text-lg font-semibold text-[#7A5A2E] mb-2">
            Manual Attendance
          </h3>
          <p className="text-sm text-[#8A7A5E] mb-4">
            Manually mark attendance for a specific date.
          </p>

          <button
            onClick={() => setPage("teacher-manual-attendance")}
            className="
              text-sm font-medium
              text-[#B8894F]
              hover:text-[#7A5A2E]
              transition
            "
          >
            Mark Attendance →
          </button>
        </div>

      </div>
    </TeacherLayout>
  );
}
