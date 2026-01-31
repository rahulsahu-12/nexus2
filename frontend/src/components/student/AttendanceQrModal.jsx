import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "../../api/axios";

export default function AttendanceQRModal({ onClose }) {
  const [manualCode, setManualCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  // Auto focus manual input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // QR SCAN FLOW
  useEffect(() => {
    if (success) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          const url = new URL(decodedText);
          const sessionCode = url.searchParams.get("session");
          if (!sessionCode) return;

          setSuccess(true);

          await axios.post("/student/attendance/mark", {
            session_code: sessionCode,
          });

          scanner.clear();
          setTimeout(onClose, 1200);
        } catch (err) {
          setSuccess(false);
          alert(
            err.response?.data?.detail ||
              "❌ Failed to mark attendance"
          );
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onClose, success]);

  // MANUAL CODE FLOW
  const submitManualCode = async () => {
    if (manualCode.length !== 6) {
      alert("Please enter 6-digit code");
      return;
    }

    try {
      setSubmitting(true);
      setSuccess(true);

      await axios.post("/student/attendance/mark", {
        digit_code: manualCode,
      });

      setTimeout(onClose, 1200);
    } catch (err) {
      setSuccess(false);
      alert(
        err.response?.data?.detail ||
          "❌ Failed to mark attendance"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 🔧 QR INTERNAL STYLES FIX */}
      <style>{`
        #qr-reader * {
          color: white !important;
        }

        #qr-reader button {
          background: #C5A059 !important;
          color: #1A2233 !important;
          border-radius: 8px !important;
          padding: 6px 12px !important;
          border: none !important;
          font-weight: 600;
        }

        #qr-reader select {
          background: white !important;
          color: #1A2233 !important;
          border-radius: 6px;
          padding: 4px;
        }

        #qr-reader option {
          color: #1A2233 !important;
        }
      `}</style>

      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: "rgba(26,34,51,0.4)" }}
      >
        {/* MODAL */}
        <div
          className={`bg-white rounded-2xl w-96 p-5 space-y-4 shadow-2xl transform transition-all duration-300 ${
            success ? "scale-105" : "scale-100"
          }`}
        >
          <h2 className="text-lg font-semibold text-center text-[#4A4E69]">
            Mark Attendance
          </h2>

          {/* QR Scanner */}
          <div
            id="qr-reader"
            className={`w-full rounded-xl overflow-hidden p-2 transition-all duration-300 ${
              success ? "ring-4 ring-[#C5A059]" : ""
            }`}
            style={{ backgroundColor: "#1A2233" }}
          />

          {success && (
            <p className="text-center text-[#C5A059] font-medium">
              ✅ Attendance marked
            </p>
          )}

          {!success && (
            <>
              <div className="text-center text-[#4A4E69] text-sm">
                OR
              </div>

              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={manualCode}
                onChange={(e) =>
                  setManualCode(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-center tracking-widest bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />

              <button
                onClick={submitManualCode}
                disabled={submitting}
                className="w-full py-2 rounded-lg font-medium transition disabled:opacity-60"
                style={{
                  backgroundColor: "#C5A059",
                  color: "#1A2233",
                }}
              >
                {submitting ? "Submitting..." : "Submit Code"}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-sm text-[#4A4E69] hover:underline"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
