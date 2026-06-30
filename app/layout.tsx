import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import Sidebar from '@/components/sidebar'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = { title: 'Email Agent', description: 'B2B 이메일 발송 관리' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geist.className} bg-gray-50 antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="ml-56 flex-1 p-8 max-w-6xl">{children}</main>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
