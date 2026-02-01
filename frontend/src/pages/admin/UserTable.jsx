import { useEffect, useState } from "react";
import axios from "../../api/axios";
import ConfirmModal from "./ConfirmModal";

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);

  const PER_PAGE = 10;

  /* ======================
     FETCH USERS
     ====================== */
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/admin/users");
      setUsers(res.data);
    } catch (err) {
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     PROMOTE STUDENT
     ====================== */
  const promoteUser = async (id) => {
    try {
      await api.put(`/admin/admin/promote/${id}`);
      alert("User promoted to teacher");
      fetchUsers();
    } catch {
      alert("Promotion failed");
    }
  };

  /* ======================
     DELETE USER
     ====================== */
  const deleteUser = async () => {
    try {
      await api.delete(`/admin/admin/users/${confirm.id}`);
      alert("User deleted");
      setConfirm(null);
      fetchUsers();
    } catch {
      alert("Delete failed");
    }
  };

  /* ======================
     SEARCH + FILTER
     ====================== */
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.mobile.includes(search) ||
      (u.name || "").toLowerCase().includes(search.toLowerCase());

    const matchRole =
      roleFilter === "all" || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  /* ======================
     PAGINATION
     ====================== */
  const totalPages = Math.ceil(filteredUsers.length / PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Loading users...
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name or mobile"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-sm outline-none"
        />

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded bg-gray-800 text-sm outline-none"
        >
          <option value="all">All roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center text-gray-500 p-6"
                >
                  No users found
                </td>
              </tr>
            )}

            {paginatedUsers.map((u) => (
              <tr
                key={u.id}
                className="border-t border-gray-800"
              >
                <td className="p-3">{u.name || "—"}</td>
                <td className="p-3">{u.mobile}</td>
                <td className="p-3 capitalize">{u.role}</td>

                <td className="p-3 space-x-2">
                  {u.role === "student" && (
                    <button
                      onClick={() => promoteUser(u.id)}
                      className="px-3 py-1 text-xs rounded bg-green-600/20 text-green-400 hover:bg-green-600/30"
                    >
                      Promote
                    </button>
                  )}

                  {u.role !== "admin" && (
                    <button
                      onClick={() => setConfirm(u)}
                      className="px-3 py-1 text-xs rounded bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 text-sm rounded ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirm && (
        <ConfirmModal
          title="Delete User"
          message={`Delete ${confirm.mobile}? This action cannot be undone.`}
          onCancel={() => setConfirm(null)}
          onConfirm={deleteUser}
        />
      )}
    </div>
  );
}
