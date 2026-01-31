import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

// EXISTING SECTIONS
import AdminStats from "./AdminStats";
import UserTable from "./UserTable";
import AttendanceAnalytics from "./AttendanceAnalytics";
import AttendanceExport from "./AttendanceExport";
import BranchUsers from "./BranchUsers";

// ✅ NEW TEACHER SECTIONS
import TeacherList from "./TeacherList";
import CreateTeacher from "./CreateTeacher";
import TeacherDetails from "./TeacherDetails";

export default function AdminDashboard() {
  const [section, setSection] = useState("dashboard");

  // ✅ SHARED STATE FOR TEACHER FLOW
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  return (
    <div className="flex min-h-screen bg-slate-900 text-gray-200">
      <AdminSidebar section={section} setSection={setSection} />

      <main className="flex-1 overflow-y-auto">
        {/* COMMON WRAPPER – KEEPING YOUR ALIGNMENT FIX */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* EXISTING SECTIONS */}
          {section === "dashboard" && <AdminStats />}
          {section === "users" && <UserTable />}
          {section === "attendance" && <AttendanceAnalytics />}
          {section === "export" && <AttendanceExport />}
          {section === "branch" && <BranchUsers />}

          {/* ✅ TEACHER MANAGEMENT */}
          {section === "teachers" && (
            <TeacherList
              setSection={setSection}
              setSelectedTeacher={setSelectedTeacher}
            />
          )}

          {section === "create-teacher" && (
            <CreateTeacher
              setSection={setSection}
              setSelectedTeacher={setSelectedTeacher}
            />
          )}

          {section === "teacher-details" && (
            <TeacherDetails
              teacher={selectedTeacher}
              setSection={setSection}
            />
          )}
        </div>
      </main>
    </div>
  );
}
