import { useState } from "react";
import api from "../../api/axios";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ chat, addMessage, updateLast }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // SAFETY: do not render until chat exists
  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#6B7280] bg-[#FDFDFD]">
        Start a new chat to begin
      </div>
    );
  }

  const streamFast = async (text) => {
    let current = "";
    const chunks = text.match(/.{1,8}/g) || [];

    for (const c of chunks) {
      current += c;
      updateLast(current);
      await new Promise((r) => setTimeout(r, 4));
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    const userText = input;

    addMessage("user", userText);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chatbot/chat", {
        message: userText,
      });

      const reply =
        res.data?.reply ||
        res.data?.answer ||
        res.data?.response ||
        "No response from AI.";

      // ADD assistant message once
      addMessage("assistant", reply);
    } catch (err) {
      addMessage("assistant", "Error getting response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 bg-[#FDFDFD]">
        <div className="max-w-3xl mx-auto space-y-4">
          {chat.messages.map((m, i) => (
            <MessageBubble key={i} {...m} />
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[#E9ECEF] bg-[#FDFDFD] p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask anything educational..."
            className="flex-1 rounded-xl bg-white border border-[#E9ECEF] px-4 py-3 text-[#1A2233] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            disabled={loading}
          />

          <button
            onClick={send}
            disabled={loading}
            className="rounded-xl px-6 font-medium transition disabled:opacity-50"
            style={{
              backgroundColor: "#C5A059",
              color: "#1A2233",
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </>
  );
}
