import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function MarkdownMessage({ content, isUser }) {
  if (!content) return null;

  const sanitizedContent = content.replace(/\*/g, "");
  const parts = sanitizedContent.split("```");

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        /* ---------- NORMAL TEXT ---------- */
        if (index % 2 === 0) {
          const text = part.trim();
          if (!text) return null;

          return (
            <CopyContainer
              key={index}
              text={text}
              isUser={isUser}
            />
          );
        }

        /* ---------- CODE BLOCK ---------- */
        const lines = part.split("\n");
        const language =
          lines[0].match(/^[a-zA-Z]+$/)?.[0] || "javascript";
        const code = lines.slice(1).join("\n").trim();
        if (!code) return null;

        return (
          <CodeBlock
            key={index}
            code={code}
            language={language}
          />
        );
      })}
    </div>
  );
}

/* ================= NORMAL TEXT ================= */

function CopyContainer({ text, isUser }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`group relative rounded-xl px-4 pt-9 pb-3 transition
        ${isUser ? "" : "bg-white border border-[#E9ECEF]"}`}
    >
      {!isUser && (
        <button
          onClick={handleCopy}
          className={`absolute top-2 right-2 text-xs px-2 py-1 rounded
            transition-all duration-200
            opacity-100 md:opacity-0 md:group-hover:opacity-100
            scale-95 group-hover:scale-100`}
          style={{
            backgroundColor: copied ? "#2D6A4F" : "#1A2233",
            color: "#FFFFFF",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      )}

      <p
        className="whitespace-pre-wrap text-sm leading-relaxed"
        style={{
          color: isUser ? "#FFFFFF" : "#1A2233",
        }}
      >
        {text}
      </p>
    </div>
  );
}

/* ================= CODE BLOCK ================= */

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 z-10 text-xs px-2 py-1 rounded
          transition-all duration-200
          opacity-100 md:opacity-0 md:group-hover:opacity-100
          scale-95 group-hover:scale-100`}
        style={{
          backgroundColor: copied ? "#2D6A4F" : "#C5A059",
          color: "#1A2233",
        }}
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          borderRadius: "0.75rem",
          background: "#1A2233",
          paddingTop: "2.5rem", // space for copy button
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
