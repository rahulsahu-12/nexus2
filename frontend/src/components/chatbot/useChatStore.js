import { useEffect, useState, useCallback } from "react";
import { v4 as uuid } from "uuid";

const STORAGE_KEY = "nexus_chats";

export function useChatStore() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // --------------------
  // LOAD FROM STORAGE
  // --------------------
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      setActiveChatId(parsed[0]?.id ?? null);
    }
  }, []);

  // --------------------
  // SAVE TO STORAGE
  // --------------------
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  // --------------------
  // CREATE NEW CHAT
  // --------------------
  const newChat = useCallback(() => {
    const chat = {
      id: uuid(),
      title: "New Chat",
      messages: [],
    };

    setChats(prev => [chat, ...prev]);
    setActiveChatId(chat.id);
  }, []);

  // --------------------
  // ADD MESSAGE
  // --------------------
  const addMessage = useCallback((role, content) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? {
              ...chat,
              title:
                chat.title === "New Chat" && role === "user"
                  ? content.slice(0, 30)
                  : chat.title,
              messages: [...chat.messages, { role, content }],
            }
          : chat
      )
    );
  }, [activeChatId]);

  // --------------------
  // UPDATE LAST MESSAGE (STREAMING SAFE)
  // --------------------
  const updateLastMessage = useCallback((content) => {
    setChats(prev =>
      prev.map(chat => {
        if (chat.id !== activeChatId) return chat;
        if (chat.messages.length === 0) return chat;

        return {
          ...chat,
          messages: chat.messages.map((m, i) =>
            i === chat.messages.length - 1
              ? { ...m, content }
              : m
          ),
        };
      })
    );
  }, [activeChatId]);

  // --------------------
  // RENAME CHAT
  // --------------------
  const renameChat = useCallback((chatId, newTitle) => {
    if (!newTitle.trim()) return;

    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, title: newTitle.trim().slice(0, 50) }
          : chat
      )
    );
  }, []);

  // --------------------
  // DELETE CHAT
  // --------------------
  const deleteChat = useCallback((chatId) => {
    setChats(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);

      // if active chat deleted → switch to first chat
      if (chatId === activeChatId) {
        setActiveChatId(filtered[0]?.id ?? null);
      }

      return filtered;
    });
  }, [activeChatId]);

  return {
    chats,
    activeChat,
    setActiveChatId,
    newChat,
    addMessage,
    updateLastMessage,
    renameChat,
    deleteChat,
  };
}
