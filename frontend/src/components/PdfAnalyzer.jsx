 import { useState } from "react";
import api from "../services/api";

function PdfAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await api.post("/pdf/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.data);
    } catch (err) {
      alert("Upload failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>PDF Analyzer</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <br /><br />

      <button onClick={handleUpload}>
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>

      {result && (
        <div>
          <h3>Notes</h3>
          <p>{result.notes}</p>

          <h3>Interview Questions</h3>
          <ul>
            {result.interview_questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PdfAnalyzer;
