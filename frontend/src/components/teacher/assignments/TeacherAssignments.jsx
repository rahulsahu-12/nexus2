import TeacherLayout from "../TeacherLayout";

export default function TeacherAssignments({ setPage }) {
  return (
    <TeacherLayout setPage={setPage}>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2F4636]">
          Assignments
        </h1>
        <p className="text-sm text-[#6F8A7A] mt-1">
          Create, manage, and analyze assignments
        </p>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* CREATE ASSIGNMENT */}
        <div
          className="
            bg-white
            border border-[#D6E1DA]
            rounded-2xl
            p-6
            shadow-[0_6px_18px_rgba(0,0,0,0.06)]
          "
        >
          <h3 className="text-lg font-semibold text-[#3D5A44] mb-2">
            Create Assignment
          </h3>
          <p className="text-sm text-[#6F8A7A] mb-4">
            Create a new assignment and assign it to students.
          </p>

          <button
            onClick={() => setPage("teacher-create-assignment")}
            className="
              text-sm font-medium
              text-[#4F7C5A]
              hover:text-[#3D5A44]
              transition
            "
          >
            Create Assignment →
          </button>
        </div>

        {/* MY ASSIGNMENTS */}
        <div
          className="
            bg-white
            border border-[#D6E1DA]
            rounded-2xl
            p-6
            shadow-[0_6px_18px_rgba(0,0,0,0.06)]
          "
        >
          <h3 className="text-lg font-semibold text-[#3D5A44] mb-2">
            My Assignments
          </h3>
          <p className="text-sm text-[#6F8A7A] mb-4">
            View all assignments you have created and check analytics.
          </p>

          <button
            onClick={() => setPage("teacher-my-assignments")}
            className="
              text-sm font-medium
              text-[#4F7C5A]
              hover:text-[#3D5A44]
              transition
            "
          >
            View Assignments →
          </button>
        </div>

      </div>
    </TeacherLayout>
  );
}
