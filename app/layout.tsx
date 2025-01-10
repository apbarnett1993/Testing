import { MessagesProvider } from '@/components/messages/messages-context';
import { ClerkProvider } from '@clerk/nextjs';
import { SocketProvider } from '@/lib/socket-context';
import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import './globals.css';
import { Geist } from 'next/font/google';
import { Azeret_Mono } from 'next/font/google';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const geistMono = Azeret_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ClerkProvider>
          <MessagesProvider>
            <SocketProvider>
              <SidebarProvider>
                <div className="flex h-screen">
                  <AppSidebar />
                  <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    {children}
                  </main>
                </div>
              </SidebarProvider>
            </SocketProvider>
          </MessagesProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}



import './globals.css'