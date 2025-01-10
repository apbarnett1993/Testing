"use client";

import { Message } from "@/types";
import { MessageWithUser } from "@/types/socket";
import { MessageComponent } from "./message";
import { MessageInput } from "./message-input";
import { useEffect, useState } from "react";
import { useSocket } from "@/lib/socket";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface ThreadProps {
  parentMessage: Message;
  isOpen: boolean;
  onClose: () => void;
}

export function Thread({ parentMessage, isOpen, onClose }: ThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const socket = useSocket();

  const convertMessage = (msg: MessageWithUser): Message => ({
    ...msg,
    createdAt: typeof msg.createdAt === 'string' ? msg.createdAt : msg.createdAt.toString(),
    updatedAt: typeof msg.updatedAt === 'string' ? msg.updatedAt : msg.updatedAt.toString(),
    reactions: msg.reactions?.map(r => ({
      id: r.messageId,
      emoji: r.emoji,
      userId: r.userId,
      user: r.user || { displayName: null, email: '' }
    })) || [],
    thread: msg.thread,
  });

  useEffect(() => {
    if (!isOpen || !parentMessage.id) return;

    setIsLoading(true);

    // Create or get thread
    fetch('/api/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageId: parentMessage.id }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((thread) => {
        // Convert MessageWithUser to Message
        const convertedMessages = (thread.messages || []).map(convertMessage);
        setMessages(convertedMessages);
        setThreadId(thread.id);
        
        // Join thread room
        if (socket) {
          console.log('Joining thread room:', thread.id);
          socket.emit("thread:join", thread.id);
        }
      })
      .catch((err) => console.error("Failed to create/get thread:", err))
      .finally(() => setIsLoading(false));
  }, [isOpen, parentMessage.id, socket]);

  // Listen for new thread messages
  useEffect(() => {
    if (!socket || !threadId) return;

    console.log('Setting up thread message listener for thread:', threadId);
    
    socket.on('thread:message', (message: MessageWithUser) => {
      console.log('Received thread message:', message);
      if (message.threadId === threadId) {
        setMessages(prev => [...prev, convertMessage(message)]);
      }
    });

    return () => {
      console.log('Cleaning up thread message listener');
      socket.off('thread:message');
    };
  }, [socket, threadId]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Thread</SheetTitle>
          <SheetDescription>
            Replies to message from {parentMessage.user.displayName || parentMessage.user.email}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100vh-8rem)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Parent Message */}
            <MessageComponent message={parentMessage} />
            
            {/* Thread Messages */}
            <div className="pl-8 space-y-4 border-l">
              {messages.map((message) => (
                <MessageComponent key={message.id} message={message} />
              ))}
              {isLoading && <div className="text-center text-muted-foreground">Loading...</div>}
            </div>
          </div>

          {/* Thread Input */}
          <div className="border-t">
            <MessageInput threadId={threadId || undefined} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 