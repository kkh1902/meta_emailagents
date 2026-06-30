'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, LayoutDashboard, Users, Settings, Clock, FileText, List, Network, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/contacts', label: '수신자 목록', icon: Users },
  { href: '/accounts', label: '발송 계정', icon: Settings },
  { href: '/template', label: '메일 템플릿', icon: FileText },
  { href: '/schedule', label: '스케줄', icon: Clock },
  { href: '/logs', label: '발송 로그', icon: List },
  { href: '/architecture', label: '아키텍처', icon: Network },
  { href: '/docs', label: '문서', icon: BookOpen },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-gray-900 text-white flex flex-col z-40">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
        <Mail className="w-5 h-5 text-blue-400" />
        <span className="font-semibold text-sm">Email Agent</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}>
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
