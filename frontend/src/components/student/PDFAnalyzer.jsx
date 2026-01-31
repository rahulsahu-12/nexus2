import React, { useState } from "react";
import axios from "../../api/axios";
import jsPDF from "jspdf";

export default function PDFAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyzePDF = async () => {
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await axios.post(
        "/pdf-analyzer/analyze",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(res.data?.data ?? res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to analyze PDF"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= PDF DOWNLOAD (FINAL) ================= */

  const downloadNotes = () => {
  if (!result) return;

  const title = result.topic || "Generated Notes";
  const notes = result.notes || "";

  const safeFileName = title
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, 35)
    .trim()
    .replace(/\s+/g, "_");

  const doc = new jsPDF("p", "pt", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 50;
  const marginY = 60;
  const maxWidth = pageWidth - marginX * 2;

  let cursorY = marginY;

  /* ---------- TITLE ---------- */
  doc.setFont("Times", "Bold");
  doc.setFontSize(20);
  const titleLines = doc.splitTextToSize(title, maxWidth);
  doc.text(titleLines, marginX, cursorY);
  cursorY += titleLines.length * 26 + 20;

  /* ---------- CONTENT ---------- */
  const blocks = notes.split("\n\n");

  blocks.forEach((block) => {
    const lines = block.split("\n");

    // 🔹 Heading
    doc.setFont("Times", "Bold");
    doc.setFontSize(14);

    if (cursorY > pageHeight - marginY) {
      doc.addPage();
      cursorY = marginY;
    }

    doc.text(lines[0], marginX, cursorY);
    cursorY += 22;

    // 🔹 Body
    doc.setFont("Times", "Normal");
    doc.setFontSize(12);

    const bodyText = lines.slice(1).join(" ");
    const bodyLines = doc.splitTextToSize(bodyText, maxWidth);

    bodyLines.forEach((line) => {
      if (cursorY > pageHeight - marginY) {
        doc.addPage();
        cursorY = marginY;
      }
      doc.text(line, marginX, cursorY);
      cursorY += 18;
    });

    cursorY += 12;
  });

  doc.save(`${safeFileName || "notes"}.pdf`);
};


  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
      <h3 className="text-xl font-semibold text-indigo-400">
        📄 Notes Analyzer (PDF)
      </h3>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="block w-full text-sm text-slate-300
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-slate-800 file:text-slate-200
          hover:file:bg-slate-700"
      />

      <button
        onClick={analyzePDF}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium w-fit"
      >
        {loading ? "Analyzing..." : "Analyze PDF"}
      </button>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {result && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-h-[550px] overflow-y-auto space-y-6">
          <h4 className="text-lg font-semibold text-slate-100">
            📘 Generated Notes
          </h4>

          <NotesOutput result={result} />

          <button
            onClick={downloadNotes}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            Download Notes (Clean PDF)
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= UI NOTES VIEW ================= */

function NotesOutput({ result }) {
  const topic = result.topic;
  const notes =
    result.notes ||
    result.summary ||
    result.content ||
    result.result ||
    "";

  return (
    <div className="space-y-4">
      {topic && (
        <div>
          <h5 className="text-indigo-300 font-semibold mb-1">
            📌 Topic
          </h5>
          <p className="text-slate-200">{topic}</p>
        </div>
      )}

      {notes && (
        <div>
          <h5 className="text-indigo-300 font-semibold mb-1">
            📝 Notes
          </h5>
          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
            {notes}
          </p>
        </div>
      )}
    </div>
  );
}
