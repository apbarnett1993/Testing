"use client"

import { AppSidebar } from "@/components/sidebar"
import { MessagesProvider } from "@/components/messages/messages-context"

export default function DirectMessageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MessagesProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </MessagesProvider>
  )
}