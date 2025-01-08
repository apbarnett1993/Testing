"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Message, SendMessagePayload } from '@/types'

interface MessagesContextType {
  messages: Message[]
  isLoading: boolean
  error: string | null
  sendMessage: (payload: SendMessagePayload) => Promise<void>
  fetchMessages: (channelId?: string, toUserId?: string) => Promise<void>
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async (channelId?: string, toUserId?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (channelId) params.append("channelId", channelId)
      if (toUserId) params.append("toUserId", toUserId)
      
      console.log("Fetching messages from:", `/api/messages?${params}`);
      const response = await fetch(`/api/messages?${params}`)
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(errorText || "Failed to fetch messages");
      }
      
      const data = await response.json()
      console.log("Fetched messages:", data);
      setMessages(data)
    } catch (err) {
      console.error("Error in fetchMessages:", err);
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (payload: SendMessagePayload) => {
    try {
      setError(null)
      console.log("Sending message:", payload);
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(errorText || "Failed to send message");
      }
      
      const newMessage = await response.json()
      console.log("Message sent successfully:", newMessage);
      setMessages(prev => [...prev, newMessage])
    } catch (err) {
      console.error("Error in sendMessage:", err);
      setError(err instanceof Error ? err.message : "Failed to send message")
      throw err
    }
  }, [])

  return (
    <MessagesContext.Provider
      value={{
        messages,
        isLoading,
        error,
        sendMessage,
        fetchMessages,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessagesContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider')
  }
  return context
}

