/**
 * MessageList component that handles displaying a list of messages for either a channel or DM.
 * Features include:
 * - Real-time message updates via WebSocket
 * - Auto-scrolling to latest messages
 * - Loading states and error handling
 * - Support for both channel and direct messages
 */

"use client";

import { useEffect, useRef } from "react";
import { useMessages } from "./messages-context";
import { MessageComponent } from "./message";
import { useSocket } from "@/lib/socket";
import { MessageWithUser } from "@/types/socket";

/**
 * Props interface for MessageList
 * @param channelId - Optional ID for channel messages
 * @param toUserId - Optional ID for direct messages
 * Note: Either channelId or toUserId should be provided, not both
 */
interface MessageListProps {
  channelId?: string;
  toUserId?: string;
}

export function MessageList({ channelId, toUserId }: MessageListProps) {
  // Get message-related utilities from context
  const { messages, isLoading, error, fetchMessages, addMessage } = useMessages();
  // Reference for auto-scrolling to bottom
  const bottomRef = useRef<HTMLDivElement>(null);
  // WebSocket connection for real-time updates
  const socket = useSocket();

  /**
   * Effect: Fetch initial messages when component mounts
   * or when channelId/toUserId changes
   */
  useEffect(() => {
    console.log("MessageList - Fetching messages for:", { channelId, toUserId });
    fetchMessages(channelId, toUserId).catch(err => {
      console.error("MessageList - Failed to fetch messages:", err);
    });
  }, [channelId, toUserId, fetchMessages]);

  /**
   * Effect: Set up real-time message listeners
   * Subscribes to new messages and adds them to the list
   */
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages from the socket
    socket.on('message', (message: MessageWithUser) => {
      console.log('Received real-time message:', message);
      addMessage(message);
    });

    // Cleanup socket listener on unmount
    return () => {
      socket.off('message');
    };
  }, [socket, addMessage]);

  /**
   * Effect: Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show loading state while fetching messages
  if (isLoading) {
    return <div className="flex-1 p-4">Loading messages...</div>;
  }

  // Show error state if message fetch failed
  if (error) {
    return (
      <div className="flex-1 p-4">
        <div className="text-red-500">Error loading messages:</div>
        <div className="text-sm mt-1">{error}</div>
        <button 
          onClick={() => fetchMessages(channelId, toUserId)}
          className="mt-2 text-sm text-blue-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        // Show empty state when no messages exist
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No messages yet</p>
        </div>
      ) : (
        // Render message list with auto-scroll anchor
        <>
          {messages.map((message) => (
            <MessageComponent key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
} 