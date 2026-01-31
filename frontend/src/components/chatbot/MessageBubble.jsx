import MarkdownMessage from "./MarkdownMessage";

export default function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div
      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser ? "ml-auto" : "mr-auto"}
      `}
      style={{
        backgroundColor: isUser ? "#1A2233" : "#F0F2F5",
        color: isUser ? "#FFFFFF" : "#1A2233",
      }}
    >
      <MarkdownMessage content={content} isUser={isUser} />
    </div>
  );
}
