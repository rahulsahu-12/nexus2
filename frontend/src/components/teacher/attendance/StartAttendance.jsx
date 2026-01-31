import { useEffect, useState, useRef } from "react";
import TeacherLayout from "../TeacherLayout";
import QRCode from "qrcode";

const API_BASE = "http://localhost:8000";

export default function StartAttendance({ setPage }) {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const qrCanvasRef = useRef(null);

  /* ---------- LOAD SUBJECTS ---------- */
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/teacher/attendance/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    loadSubjects();
  }, []);

  /* ---------- AUTO SELECT YEAR ---------- */
  const handleSubjectChange = async (value) => {
    setSubject(value);
    setYear("");
    setAvailableYears([]);

    if (!value) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/teacher/attendance/subject-years/${value}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const years = await res.json();

      if (years.length === 1) {
        setYear(String(years[0]));
      } else {
        setAvailableYears(years);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- QR GENERATION ---------- */
  useEffect(() => {
    if (!session || !qrCanvasRef.current) return;
    QRCode.toCanvas(qrCanvasRef.current, session.digit_code, {
      width: 180,
      margin: 2,
    });
  }, [session]);

  /* ---------- COUNTDOWN TIMER ---------- */
  useEffect(() => {
    if (!session) return;

    const expiresAt = new Date(session.expires_at + "Z").getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.floor((expiresAt - now) / 1000);
      setRemainingSeconds(diff > 0 ? diff : 0);
    };

    tick(); // initial
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const isExpired = remainingSeconds <= 0 && session;

  /* ---------- START SESSION ---------- */
  const startAttendance = async () => {
    if (!subject || !year) {
      setError("Subject and year are required");
      return;
    }

    setSession(null);
    setRemainingSeconds(0);
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/teacher/attendance/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify({ subject, year: Number(year) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setSession(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- FORMAT COUNTDOWN ---------- */
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <TeacherLayout setPage={setPage}>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#7A5A2E]">
          Start Attendance
        </h1>
        <p className="text-sm text-[#8A7A5E] mt-1">
          Create a new attendance session for your class
        </p>
      </div>

      {/* ---------- CREATE SESSION ---------- */}
      {!session && (
        <div className="max-w-md bg-white border rounded-2xl p-6 shadow space-y-5">
          <select
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={!subject}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select year</option>
            {(availableYears.length ? availableYears : [1, 2, 3, 4]).map(
              (y) => (
                <option key={y} value={y}>
                  {y} Year
                </option>
              )
            )}
          </select>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={startAttendance}
            disabled={loading}
            className="w-full py-2 rounded bg-[#D9A066] text-white"
          >
            {loading ? "Starting…" : "Start Attendance"}
          </button>
        </div>
      )}

      {/* ---------- SESSION ACTIVE ---------- */}
      {session && (
        <div className="max-w-md bg-white border rounded-2xl p-6 shadow text-center space-y-4">
          <h2 className="text-lg font-semibold">Attendance Started</h2>

          <div className="text-3xl font-mono font-bold text-[#D9A066]">
            {session.digit_code}
          </div>

          <div className="flex justify-center">
            <canvas ref={qrCanvasRef} />
          </div>

          {!isExpired ? (
            <p className="text-sm text-green-700 font-semibold">
              ⏳ Expires in {formatTime(remainingSeconds)}
            </p>
          ) : (
            <p className="text-sm text-red-600 font-semibold">
              ⛔ Attendance session expired
            </p>
          )}

          <button
            onClick={() => setPage("teacher-attendance")}
            className="text-sm text-[#B8894F]"
          >
            Back to Attendance
          </button>
        </div>
      )}
    </TeacherLayout>
  );
}
