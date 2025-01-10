/**
 * MessageReactions component handles displaying and managing emoji reactions on messages.
 * It shows grouped reactions with user counts and provides interaction for adding/removing reactions.
 */

"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmojiPicker } from "./emoji-picker";
import { cn } from "@/lib/utils";

/**
 * Single reaction data structure from the database
 * Includes the emoji, user info, and IDs for tracking
 */
interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  user: {
    displayName: string | null;
    email: string;
  };
}

/**
 * Props for the MessageReactions component
 * @param reactions - Array of reactions on the message
 * @param onReact - Callback when user adds a new reaction
 * @param onRemoveReaction - Optional callback when user removes their reaction
 * @param currentUserId - ID of current user to track their reactions
 */
interface MessageReactionsProps {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  onRemoveReaction?: (reactionId: string) => void;
  currentUserId: string;
}

/**
 * Helper interface for grouping similar reactions
 * Used to combine multiple instances of the same emoji
 */
interface ReactionGroup {
  count: number;
  users: string[];
  reactions: Reaction[];
}

export function MessageReactions({ 
  reactions = [], 
  onReact, 
  onRemoveReaction,
  currentUserId 
}: MessageReactionsProps) {
  // Group reactions by emoji for efficient display
  const reactionGroups = reactions.reduce((acc, reaction) => {
    const existing = acc.get(reaction.emoji) || { count: 0, users: [], reactions: [] };
    existing.count++;
    existing.users.push(reaction.user.displayName || reaction.user.email);
    existing.reactions.push(reaction);
    acc.set(reaction.emoji, existing);
    return acc;
  }, new Map<string, ReactionGroup>());

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {/* Map through grouped reactions and render them */}
      {Array.from(reactionGroups.entries()).map(([emoji, { count, users, reactions: groupReactions }]) => {
        // Check if current user has already reacted with this emoji
        const hasReacted = groupReactions.some(reaction => reaction.userId === currentUserId);
        return (
          <TooltipProvider key={emoji}>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Reaction button with count */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-xs gap-1 hover:bg-muted",
                    hasReacted && "bg-muted"
                  )}
                  onClick={() => {
                    // Toggle reaction based on whether user has already reacted
                    if (hasReacted && onRemoveReaction) {
                      const reaction = groupReactions.find(reaction => reaction.userId === currentUserId);
                      if (reaction) onRemoveReaction(reaction.id);
                    } else {
                      onReact(emoji);
                    }
                  }}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </Button>
              </TooltipTrigger>
              {/* Tooltip showing users who reacted */}
              <TooltipContent>
                <p>{users.join(", ")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}

      {/* Add reaction button with emoji picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1 hover:bg-muted"
          >
            <PlusCircle className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="end">
          <EmojiPicker onEmojiSelect={onReact} />
        </PopoverContent>
      </Popover>
    </div>
  );
} 