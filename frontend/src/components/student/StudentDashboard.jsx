import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import AttendanceQrModal from "./AttendanceQrModal";
import PDFAnalyzer from "./PDFAnalyzer";
import StudentAssignments from "./assignments/StudentAssignments";
import StudentNotes from "./StudentNotes";
import ChatbotPage from "../chatbot/ChatbotPage";

export default function StudentDashboard({ setPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("attendance");
  const [showQR, setShowQR] = useState(false);

  // 📱 AUTO COLLAPSE ON MOBILE
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    setPage("login");
  };

  // 🤖 CHATBOT FULL SCREEN
  if (activeView === "chatbot") {
    return <ChatbotPage onBack={() => setActiveView("attendance")} />;
  }

  return (
    <div className="bg-[#F4F1EE] min-h-screen text-slate-800">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeView={activeView}
        setActiveView={setActiveView}
        setPage={setPage}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-16 md:ml-64" : "ml-16"
        }`}
      >
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* ☰ Mobile Sidebar Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-[#4895EF] text-2xl font-bold"
            >
              ☰
            </button>

            <h1 className="text-lg font-semibold text-[#4895EF] capitalize">
              {activeView.replace("-", " ")}
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-[#9E3F3F] hover:underline"
          >
            Logout
          </button>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {activeView === "attendance" && (
            <AttendanceSection onScan={() => setShowQR(true)} />
          )}

          {activeView === "assignments" && <StudentAssignments />}
          {activeView === "notes" && <StudentNotes />}
          {activeView === "pdf" && <PDFAnalyzer />}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <AttendanceQrModal onClose={() => setShowQR(false)} />
      )}
    </div>
  );
}

/* ================= ATTENDANCE ================= */

function AttendanceSection({ onScan }) {
  // STATIC (backend safe)
  const total = 40;
  const present = 34;
  const absent = total - present;
  const percent = Math.round((present / total) * 100);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Attendance</h2>
          <p className="text-slate-500">
            Scan QR code to mark your attendance
          </p>
        </div>

        <ProgressRing percent={percent} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
        <Stat label="Total" value={total} />
        <Stat label="Present" value={present} color="#006B5D" />
        <Stat label="Absent" value={absent} color="#9E3F3F" />
      </div>

      {/* Action */}
      <button
        onClick={onScan}
        className="w-full md:w-auto bg-[#4895EF] hover:bg-[#006B5D] text-white font-semibold px-8 py-3 rounded-xl transition"
      >
        Scan QR
      </button>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Stat({ label, value, color }) {
  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{
        backgroundColor: color ? `${color}20` : "#F4F1EE",
        color: color || "#334155",
      }}
    >
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-xl md:text-2xl font-bold">{value}</p>
    </div>
  );
}

function ProgressRing({ percent }) {
  const radius = 34;
  const stroke = 6;
  const normalized = radius - stroke * 2;
  const circumference = normalized * 2 * Math.PI;
  const offset =
    circumference - (percent / 100) * circumference;

  return (
    <svg height="80" width="80">
      <circle
        stroke="#E5E7EB"
        fill="transparent"
        strokeWidth={stroke}
        r={normalized}
        cx="40"
        cy="40"
      />
      <circle
        stroke="#006B5D"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset: offset }}
        r={normalized}
        cx="40"
        cy="40"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-sm font-semibold fill-slate-700"
      >
        {percent}%
      </text>
    </svg>
  );
}
