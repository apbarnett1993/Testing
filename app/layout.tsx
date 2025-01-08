import type { Metadata } from 'next'
import { Geist, Azeret_Mono as Geist_Mono } from 'next/font/google'
import { AppSidebar } from '@/components/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { MessagesProvider } from '@/components/messages/messages-context'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Chat App',
  description: 'A Slack-like chat application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        >
          <MessagesProvider>
            <SidebarProvider>
              <div className="flex h-screen">
                <AppSidebar />
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                  {children}
                </main>
              </div>
            </SidebarProvider>
          </MessagesProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}



import './globals.css'