import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { useEffect } from "react";
import { useChatStore } from "./useChatStore";

export default function ChatbotPage({ onBack }) {
  const {
    chats,
    activeChat,
    setActiveChatId,
    newChat,
    addMessage,
    updateLastMessage,
    renameChat,
    deleteChat,
  } = useChatStore();

  useEffect(() => {
    if (!activeChat) {
      newChat();
    }
  }, [activeChat, newChat]);

  return (
    <div className="fixed inset-0 flex bg-[#FDFDFD] text-[#1A2233]">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        activeId={activeChat?.id}
        onSelect={setActiveChatId}
        onNew={newChat}
        onRename={renameChat}
        onDelete={deleteChat}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative bg-[#FDFDFD]">
        {/* Top Bar */}
        <div className="h-14 border-b border-[#E9ECEF] flex items-center px-4 md:px-6">
          <button
            onClick={onBack}
            className="text-sm text-[#4A4E69] hover:underline"
          >
            ← Back
          </button>
        </div>

        <ChatWindow
          chat={activeChat}
          addMessage={addMessage}
          updateLast={updateLastMessage}
        />
      </div>
    </div>
  );
}
