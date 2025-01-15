/**
 * Individual message component that displays a single chat message with user info,
 * timestamp, content, and reactions. Supports both channel messages and DMs.
 */

"use client";

import { Message } from "@/types";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { User, MessageSquare } from "lucide-react";
import { MessageReactions } from "./message-reactions";
import { useSocket } from "@/lib/socket";
import { ReactionPayload, RemoveReactionPayload } from "@/types/socket";
import { Thread } from "./thread";
import { Button } from "@/components/ui/button";
import { useState } from "react";

/**
 * Props for the MessageComponent including the message data with user info
 * and an array of reactions. The message object is extended with user details
 * and reaction data from the database.
 */
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
    reactions: Array<{
      id: string;
      emoji: string;
      userId: string;
      user: {
        displayName: string | null;
        email: string;
      };
    }>;
    attachments?: Array<{
      id: string;
      filename: string;
      url: string;
      size: number;
      mimeType: string;
    }>;
  };
}

export function MessageComponent({ message }: MessageProps) {
  // Get current user to determine if this message was sent by them
  const { user: currentUser } = useUser();
  const socket = useSocket();
  const isOwn = message.userId === currentUser?.id;
  const [isThreadOpen, setIsThreadOpen] = useState(false);

  const handleReact = (emoji: string) => {
    if (!socket || !currentUser) return;
    
    console.log('React with:', emoji);
    console.log('currentUser:', currentUser);

    const payload: ReactionPayload = {
      messageId: message.id,
      emoji
    };
    socket.emit('reaction:add', payload);
  };

  const handleRemoveReaction = (reactionId: string) => {
    if (!socket || !currentUser) return;

    console.log('Remove reaction:', reactionId);

    const reaction = message.reactions.find(r => r.id === reactionId);
    if (!reaction) return;

    const payload: RemoveReactionPayload = {
      messageId: message.id,
      emoji: reaction.emoji,
      userId: currentUser.id
    };
    socket.emit('reaction:remove', payload);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');
  const isVideo = (mimeType: string) => mimeType.startsWith('video/');
  const isAudio = (mimeType: string) => mimeType.startsWith('audio/');

  return (
    // Container with conditional flex direction based on message ownership
    <div className={`flex gap-3 p-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* User avatar section */}
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

      {/* Message content and metadata section */}
      <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : ''}`}>
        {/* User name and timestamp */}
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

        {/* Message content with rich text support */}
        <div
          className={`rounded-lg px-3 py-2 text-sm prose prose-sm max-w-none ${
            isOwn
              ? 'bg-primary text-primary-foreground prose-invert [&_ul]:text-primary-foreground [&_ol]:text-primary-foreground'
              : 'bg-muted'
          } [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4`}
          dangerouslySetInnerHTML={{ __html: message.content }}
        />

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  isOwn ? 'bg-primary/10' : 'bg-muted/50'
                }`}
              >
                {isImage(attachment.mimeType) ? (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block max-w-sm"
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className="rounded-lg max-h-48 object-cover"
                    />
                  </a>
                ) : isVideo(attachment.mimeType) ? (
                  <video
                    src={attachment.url}
                    controls
                    className="rounded-lg max-h-48"
                  />
                ) : isAudio(attachment.mimeType) ? (
                  <audio src={attachment.url} controls className="w-full" />
                ) : (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                  >
                    <span>{attachment.filename}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(attachment.size)})
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message actions */}
        <div className="flex items-center gap-2">
          {/* Message reactions section */}
          <MessageReactions
            reactions={message.reactions || []}
            onReact={handleReact}
            onRemoveReaction={handleRemoveReaction}
            currentUserId={currentUser?.id || ''}
          />

          {/* Reply in thread button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1 hover:bg-muted"
            onClick={() => setIsThreadOpen(true)}
          >
            <MessageSquare className="h-3 w-3" />
            {message.thread?.messages?.length ? `${message.thread.messages.length} replies` : 'Reply'}
          </Button>
        </div>
      </div>

      {/* Thread view */}
      <Thread
        parentMessage={message}
        isOpen={isThreadOpen}
        onClose={() => setIsThreadOpen(false)}
      />
    </div>
  );
} 