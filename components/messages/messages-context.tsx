"use client"

import { createContext, useCallback, useContext, useState } from "react";
import { MessageWithUser } from "@/types/socket";

interface MessagesContextType {
  messages: MessageWithUser[];
  isLoading: boolean;
  error: string | null;
  fetchMessages: (channelId?: string, toUserId?: string) => Promise<void>;
  addMessage: (message: MessageWithUser) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (channelId?: string, toUserId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (channelId) params.append('channelId', channelId);
      if (toUserId) params.append('toUserId', toUserId);

      const response = await fetch(`/api/messages?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMessage = useCallback((message: MessageWithUser) => {
    setMessages(prev => [...prev, message]);
  }, []);

  return (
    <MessagesContext.Provider value={{ messages, isLoading, error, fetchMessages, addMessage }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}

