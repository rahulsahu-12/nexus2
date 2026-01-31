import React from "react";

export default function Sidebar({
  open,
  onToggle,
  activeView,
  setActiveView,
  setPage,
}) {
  return (
    <div
      className={`${
        open ? "w-64" : "w-16"
      } bg-[#1A2233] text-slate-200 h-screen fixed left-0 top-0 transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {open && (
          <span className="text-lg font-semibold text-indigo-400">
            NEXUS
          </span>
        )}
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-white"
        >
          ☰
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-4 space-y-1">
        <MenuItem label="Attendance" view="attendance" open={open} activeView={activeView} setActiveView={setActiveView} />
        <MenuItem label="Assignments" view="assignments" open={open} activeView={activeView} setActiveView={setActiveView} />
        <MenuItem label="Notes" view="notes" open={open} activeView={activeView} setActiveView={setActiveView} />
        <MenuItem label="PDF Analyzer" view="pdf" open={open} activeView={activeView} setActiveView={setActiveView} />
        <MenuItem label="AI Chat" view="chatbot" open={open} activeView={activeView} setActiveView={setActiveView} />
      </nav>
    </div>
  );
}

/* ================= MENU ITEM ================= */

function MenuItem({ label, view, open, activeView, setActiveView }) {
  const active = activeView === view;

  return (
    <div
      onClick={() => setActiveView(view)}
      className={`px-4 py-3 cursor-pointer text-sm transition ${
        active
          ? "bg-[#222B44] text-indigo-400"
          : "text-slate-300 hover:bg-[#222B44]"
      }`}
    >
      {open ? label : label.charAt(0)}
    </div>
  );
}
