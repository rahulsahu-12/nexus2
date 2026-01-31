import { useState } from "react";
import api from "../services/api";

function YouTubeLearning() {
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post("/youtube/learning-assistant", {
        title,
        channel,
      });
      setResult(res.data.data);
    } catch (err) {
      alert("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>YouTube Learning Assistant</h2>

      <input
        placeholder="Video Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Channel Name"
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
      />
      <br /><br />

      <button onClick={handleSubmit}>
        {loading ? "Loading..." : "Generate"}
      </button>

      {result && (
        <div>
          <h3>Notes</h3>
          <p>{result.notes}</p>

          <h3>MCQs</h3>
          {result.mcqs.map((q, i) => (
            <div key={i}>
              <p>{q.question}</p>
              <ul>
                {q.options.map((op, idx) => (
                  <li key={idx}>{op}</li>
                ))}
              </ul>
              <b>Answer: {q.answer}</b>
            </div>
          ))}

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

export default YouTubeLearning;
