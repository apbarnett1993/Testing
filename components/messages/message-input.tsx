"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/lib/socket"
import { RichTextEditor } from "./rich-text-editor"

interface MessageInputProps {
  channelId?: string
  toUserId?: string
  threadId?: string
}

export function MessageInput({ channelId, toUserId, threadId }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()
  const socket = useSocket()

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!user || !content.trim() || isLoading || !socket) return

    try {
      setIsLoading(true)
      
      socket.emit('message', {
        content: content.trim(),
        userId: user.id,
        channelId,
        toUserId,
        threadId,
      })

      setContent("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex flex-col gap-2">
        <RichTextEditor
          content={content}
          onChange={setContent}
          onSubmit={handleSubmit}
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            <SendHorizontal className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </form>
  )
}

