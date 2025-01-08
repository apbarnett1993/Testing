"use client";

import { useEffect, useRef } from "react";
import { useMessages } from "./messages-context";
import { MessageComponent } from "./message";

interface MessageListProps {
  channelId?: string;
  toUserId?: string;
}

export function MessageList({ channelId, toUserId }: MessageListProps) {
  const { messages, isLoading, error, fetchMessages } = useMessages();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("MessageList - Fetching messages for:", { channelId, toUserId });
    fetchMessages(channelId, toUserId).catch(err => {
      console.error("MessageList - Failed to fetch messages:", err);
    });
  }, [channelId, toUserId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return <div className="flex-1 p-4">Loading messages...</div>;
  }

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
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No messages yet</p>
        </div>
      ) : (
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