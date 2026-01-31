import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function StudentNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes/student");
        setNotes(res.data || []);
      } catch (err) {
        console.error("Failed to load notes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleDownload = async (note) => {
    try {
      setDownloadingId(note.id);

      const res = await api.get(
        `/notes/download/${note.id}`,
        { responseType: "blob" } // 🔑 VERY IMPORTANT
      );

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = note.filename || "notes";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download file");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-slate-400 text-sm">
        Loading notes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-400">
        Class Notes
      </h2>

      {notes.length === 0 ? (
        <p className="text-slate-400 text-sm">
          No notes uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {note.subject}
                </p>
                <p className="text-xs text-slate-400">
                  {note.filename}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(note.uploaded_at).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => handleDownload(note)}
                disabled={downloadingId === note.id}
                className="text-sm text-indigo-400 hover:underline disabled:text-slate-500"
              >
                {downloadingId === note.id ? "Downloading..." : "Download"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
