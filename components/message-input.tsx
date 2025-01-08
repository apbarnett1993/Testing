"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/lib/socket";

interface MessageInputProps {
  channelId?: string;
  toUserId?: string;
}

export function MessageInput({ channelId, toUserId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const socket = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim() || isLoading || !socket) return;

    try {
      setIsLoading(true);
      
      socket.emit('message', {
        content: content.trim(),
        userId: user.id,
        channelId,
        toUserId,
      });

      setContent("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="resize-none"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <SendHorizontal className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
} 