import {
  LayoutDashboard,
  Users,
  Layers,
  ClipboardList,
  Download,
  LogOut
} from "lucide-react";

export default function AdminSidebar({ section, setSection }) {
  const menu = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "users", label: "All Users", icon: <Users size={18} /> },
    { key: "teachers", label: "Teachers", icon: <Users size={18} /> },
    { key: "branch", label: "Branch Users", icon: <Layers size={18} /> },
    { key: "attendance", label: "Attendance", icon: <ClipboardList size={18} /> },
    { key: "export", label: "Export", icon: <Download size={18} /> }

  ];

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.reload(); // redirects to login
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
      {/* HEADER */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-lg font-semibold text-indigo-400">
          Admin Panel
        </h1>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => setSection(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
              ${
                section === item.key
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="border-t border-slate-800 p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
