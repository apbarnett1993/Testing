"use client";

import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const EMOJI_GROUPS = {
  "Smileys": ["😀", "😊", "🙂", "😄", "😅", "😂", "🤣", "😉", "😍", "🥰"],
  "Gestures": ["👍", "👎", "👌", "👏", "🙌", "👋", "✌️", "🤞", "🤝", "🤗"],
  "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💖"],
  "Objects": ["💡", "⭐", "🔥", "✨", "💫", "🎉", "🎈", "🎁", "💎", "🔔"],
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="grid gap-4 p-4">
          {Object.entries(EMOJI_GROUPS).map(([category, emojis]) => (
            <div key={category}>
              <h4 className="mb-2 text-sm font-medium">{category}</h4>
              <div className="grid grid-cols-10 gap-2">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => onEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
} 