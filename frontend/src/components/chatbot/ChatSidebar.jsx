import { useState } from "react";

export default function ChatSidebar({
  chats,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
}) {
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  return (
    <div className="w-72 bg-[#0B132B] border-r border-[#1C2541] p-4 flex flex-col">
      {/* New Chat */}
      <button
        onClick={onNew}
        className="mb-4 w-full rounded-xl py-2 text-sm font-medium transition"
        style={{
          backgroundColor: "#C5A059",
          color: "#0B132B",
        }}
      >
        + New chat
      </button>

      {/* Chat List */}
      <div className="flex-1 space-y-1 overflow-y-auto">
        {chats.map((chat) => {
          const active = chat.id === activeId;

          return (
            <div
              key={chat.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition
                ${
                  active
                    ? "bg-[#1C2541] text-white"
                    : "text-slate-300 hover:bg-[#1C2541]/70"
                }`}
            >
              {/* Title / Rename */}
              {editingId === chat.id ? (
                <input
                  autoFocus
                  value={tempTitle}
                  onChange={(e) =>
                    setTempTitle(e.target.value)
                  }
                  onBlur={() => {
                    onRename(chat.id, tempTitle);
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onRename(chat.id, tempTitle);
                      setEditingId(null);
                    }
                  }}
                  className="flex-1 bg-transparent border-b border-[#C5A059] outline-none text-white"
                />
              ) : (
                <div
                  onClick={() => onSelect(chat.id)}
                  className="flex-1 truncate cursor-pointer"
                >
                  {chat.title}
                </div>
              )}

              {/* Actions */}
              <div className="ml-2 hidden group-hover:flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(chat.id);
                    setTempTitle(chat.title);
                  }}
                  className="text-xs text-slate-300 hover:text-white"
                  title="Rename"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setDeleteId(chat.id)}
                  className="text-xs text-slate-300 hover:text-red-400"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0B132B] rounded-xl p-6 w-80 border border-[#1C2541]">
            <h3 className="text-white font-medium mb-3">
              Delete chat?
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteId);
                  setDeleteId(null);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-[#9E3F3F] hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
