"use client"

import { useState } from "react"
import { useMessages } from "./messages-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal } from "lucide-react"

interface MessageInputProps {
  channelId?: string
  toUserId?: string
}

export function MessageInput({ channelId, toUserId }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { sendMessage } = useMessages()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSending) return

    try {
      setIsSending(true)
      await sendMessage({
        content: content.trim(),
        channelId,
        toUserId,
      })
      setContent("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="min-h-[20px] max-h-[200px] resize-none"
          disabled={isSending}
        />
        <Button type="submit" size="icon" disabled={!content.trim() || isSending}>
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}

