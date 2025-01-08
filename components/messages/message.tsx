"use client";

import { Message } from "@/types";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { User } from "lucide-react";

interface MessageProps {
  message: Message;
}

export function MessageComponent({ message }: MessageProps) {
  const { user } = useUser();
  const isOwn = message.userId === user?.id;

  return (
    <div className={`flex gap-3 p-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <User className="h-5 w-5" />
      </div>
      <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isOwn ? user?.fullName || 'You' : `User ${message.userId.slice(0, 6)}`}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.createdAt), 'p')}
          </span>
        </div>
        <p className={`rounded-lg px-3 py-2 text-sm ${
          isOwn 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}>
          {message.content}
        </p>
      </div>
    </div>
  );
} 