import React, { useState, useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

// AUTH
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLogin from "./pages/auth/AdminLogin";

// DASHBOARDS
import StudentDashboard from "./components/student/StudentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import ChatbotPage from "./components/chatbot/ChatbotPage";

// TEACHER – ATTENDANCE
import TeacherAttendance from "./components/teacher/attendance/TeacherAttendance";
import StartAttendance from "./components/teacher/attendance/StartAttendance";
import ActiveAttendance from "./components/teacher/attendance/ActiveAttendance";
import AttendanceHistory from "./components/teacher/attendance/AttendanceHistory";
import ManualAttendance from "./components/teacher/attendance/ManualAttendance"; // ✅ ADDED

// TEACHER – ASSIGNMENTS
import TeacherAssignments from "./components/teacher/assignments/TeacherAssignments";
import CreateAssignment from "./components/teacher/assignments/CreateAssignment";
import MyAssignments from "./components/teacher/assignments/MyAssignments";
import AssignmentAnalytics from "./components/teacher/assignments/AssignmentAnalytics";

// TEACHER – NOTES
import TeacherNotes from "./components/teacher/notes/TeacherNotes";
import UploadNotes from "./components/teacher/notes/UploadNotes";
import MyNotes from "./components/teacher/notes/MyNotes";

function App() {
  const [page, setPage] = useState("login");

  // ✅ AUTO REDIRECT ON REFRESH
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
      setPage("login");
      return;
    }

    if (role === "student") setPage("student-dashboard");
    else if (role === "teacher") setPage("teacher-dashboard");
    else if (role === "admin") setPage("admin-dashboard");
    else setPage("login");
  }, []);

  // ===== ADMIN / STAFF LOGIN =====
  if (page === "admin-login") {
    return (
      <AdminLogin
        onSuccess={(role) => {
          localStorage.setItem("role", role);
          if (role === "admin") setPage("admin-dashboard");
          if (role === "teacher") setPage("teacher-dashboard");
        }}
        onBack={() => setPage("login")}
      />
    );
  }

  // ===== REGISTER =====
  if (page === "register") {
    return <Register onBack={() => setPage("login")} />;
  }

  // ===== LOGIN =====
  if (page === "login") {
    return (
      <Login
        onLogin={(role) => {
          localStorage.setItem("role", role);
          if (role === "student") setPage("student-dashboard");
          else if (role === "teacher") setPage("teacher-dashboard");
          else if (role === "admin") setPage("admin-dashboard");
        }}
        onRegister={() => setPage("register")}
        onAdmin={() => setPage("admin-login")}
      />
    );
  }

  // ===== STUDENT DASHBOARD =====
  if (page === "student-dashboard") {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <StudentDashboard setPage={setPage} />
      </ProtectedRoute>
    );
  }

  // ===== TEACHER DASHBOARD =====
  if (page === "teacher-dashboard") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <TeacherDashboard setPage={setPage} />
      </ProtectedRoute>
    );
  }

  // ===== TEACHER ATTENDANCE =====
  if (page === "teacher-attendance") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <TeacherAttendance setPage={setPage} />
      </ProtectedRoute>
    );
  }

  if (page === "teacher-start-attendance") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <StartAttendance setPage={setPage} />
      </ProtectedRoute>
    );
  }

  if (page === "teacher-active-attendance") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <ActiveAttendance setPage={setPage} />
      </ProtectedRoute>
    );
  }

  if (page === "teacher-attendance-history") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <AttendanceHistory setPage={setPage} />
      </ProtectedRoute>
    );
  }

  // ===== ✅ MANUAL ATTENDANCE (ADDED) =====
  if (page === "teacher-manual-attendance") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <ManualAttendance setPage={setPage} />
      </ProtectedRoute>
    );
  }

  // ===== TEACHER ASSIGNMENTS =====
  if (page === "teacher-assignments") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <TeacherAssignments setPage={setPage} />
      </ProtectedRoute>
    );
  }

  if (page === "teacher-create-assignment") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <CreateAssignment setPage={setPage} />
      </ProtectedRoute>
    );
  }

  if (page === "teacher-my-assignments") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <MyAssignments setPage={setPage} />
      </ProtectedRoute>
    );
  }

  // ANALYTICS (DYNAMIC)
  if (page.startsWith("teacher-assignment-analytics-")) {
    const assignmentId = page.split("teacher-assignment-analytics-")[1];

    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <AssignmentAnalytics
          assignmentId={assignmentId}
          setPage={setPage}
        />
      </ProtectedRoute>
    );
  }

  // ===== TEACHER NOTES =====
  if (page === "teacher-notes") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <TeacherNotes setPage={setPage} />
      </ProtectedRoute>
    );
  }

  if (page === "teacher-upload-notes") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <UploadNotes setPage={setPage} />
      </ProtectedRoute>
    );
  }

  if (page === "teacher-my-notes") {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <MyNotes setPage={setPage} />
      </ProtectedRoute>
    );
  }

  // ===== AI CHAT (STUDENT ONLY) =====
  if (page === "ai-chat") {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <ChatbotPage onBack={() => setPage("student-dashboard")} />
      </ProtectedRoute>
    );
  }

  // ===== ADMIN DASHBOARD =====
  if (page === "admin-dashboard") {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    );
  }

  // ===== FALLBACK =====
  return <Login onLogin={() => setPage("login")} />;
}

export default App;
