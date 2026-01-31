import { useState } from "react";

import TeacherDashboard from "./TeacherDashboard";
import TeacherAttendance from "./attendance/TeacherAttendance";
import StartAttendance from "./attendance/StartAttendance";
import ManualAttendance from "./attendance/ManualAttendance";
import AttendanceHistory from "./attendance/AttendanceHistory";

export default function TeacherRoot() {
  const [page, setPage] = useState("teacher-dashboard");

  if (page === "teacher-dashboard") {
    return <TeacherDashboard setPage={setPage} />;
  }

  // MAIN ATTENDANCE PAGE
  if (page === "teacher-attendance" || page === "teacher-active-attendance") {
    return <TeacherAttendance setPage={setPage} />;
  }

  // START ATTENDANCE
  if (page === "teacher-start-attendance") {
    return <StartAttendance setPage={setPage} />;
  }

  // MANUAL ATTENDANCE
  if (page === "teacher-manual-attendance") {
    return <ManualAttendance setPage={setPage} />;
  }

  // ATTENDANCE HISTORY
  if (page === "teacher-attendance-history") {
    return <AttendanceHistory setPage={setPage} />;
  }

  // fallback safety
  return <TeacherDashboard setPage={setPage} />;
}
