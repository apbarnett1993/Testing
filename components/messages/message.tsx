"use client";

import { Message } from "@/types";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { User } from "lucide-react";

interface MessageProps {
  message: Message & {
    user: {
      id: string;
      email: string;
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    };
  };
}

export function MessageComponent({ message }: MessageProps) {
  const { user: currentUser } = useUser();
  const isOwn = message.userId === currentUser?.id;

  return (
    <div className={`flex gap-3 p-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        {message.user.imageUrl ? (
          <img
            src={message.user.imageUrl}
            alt="Profile"
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <User className="h-5 w-5" />
        )}
      </div>
      <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isOwn
              ? 'You'
              : message.user.displayName || message.user.email.split('@')[0]}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.createdAt), 'p')}
          </span>
        </div>
        <div
          className={`rounded-lg px-3 py-2 text-sm prose prose-sm max-w-none ${
            isOwn
              ? 'bg-primary text-primary-foreground prose-invert [&_ul]:text-primary-foreground [&_ol]:text-primary-foreground'
              : 'bg-muted'
          } [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4`}
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
      </div>
    </div>
  );
} 