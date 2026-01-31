export default function TeacherSidebar({ setPage }) {
  return (
    <aside
      className="
        fixed left-0 top-0 h-screen w-64
        bg-[#006D77]
        px-6 py-8
        flex flex-col
        shadow-[4px_0_24px_rgba(0,0,0,0.25)]
      "
    >
      {/* 🎓 BRAND */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[#EDF6F9]">
          Faculty Portal
        </h2>
        <p className="text-xs text-[#CDEEEF] mt-1">
          Teacher Dashboard
        </p>
      </div>

      {/* 📂 NAVIGATION */}
      <nav className="flex-1 space-y-1">
        <Nav label="Dashboard" onClick={() => setPage("teacher-dashboard")} />
        <Nav label="Attendance" onClick={() => setPage("teacher-attendance")} />
        <Nav label="Assignments" onClick={() => setPage("teacher-assignments")} />
        <Nav label="Notes" onClick={() => setPage("teacher-notes")} />
      </nav>

      {/* 🚪 LOGOUT */}
      <div className="pt-6 border-t border-[#0A9396]">
        <button
          onClick={() => {
            localStorage.clear();
            setPage("login");
          }}
          className="
            w-full text-left
            text-sm font-medium
            text-[#FFDDD2]
            hover:text-[#FFD6C9]
            transition
          "
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

function Nav({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full text-left
        px-4 py-2.5 rounded-lg
        text-sm font-medium
        text-[#EDF6F9]
        hover:bg-[#0A9396]
        transition
      "
    >
      {label}
    </button>
  );
}
