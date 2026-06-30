'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface Log { id: number; sent_at: string; company: string; email: string; account_used: string; mail_type: string; status: string; error_msg: string }

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = async () => {
    const r = await fetch(`/api/logs?page=${page}`).then(r => r.json())
    setLogs(r.logs || [])
    setTotal(r.total || 0)
    setTotalPages(r.totalPages || 1)
  }

  useEffect(() => { load() }, [page])

  const clear = async () => {
    if (!confirm('로그를 모두 삭제하시겠습니까?')) return
    await fetch('/api/logs', { method: 'DELETE' })
    toast.success('로그 삭제 완료'); load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">발송 로그</h1>
          <p className="text-sm text-gray-500 mt-1">총 {total}건</p>
        </div>
        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={clear}>
          <Trash2 className="w-3 h-3 mr-1" />로그 삭제
        </Button>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/80">
                <th className="text-left px-5 py-3 font-medium text-gray-600 text-xs">시간</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">회사</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">이메일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">발송계정</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">유형</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">오류</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length === 0 && <tr><td colSpan={7} className="text-center text-gray-400 py-12">로그 없음</td></tr>}
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{log.sent_at?.slice(5, 16)}</td>
                  <td className="px-4 py-3 font-medium">{log.company}</td>
                  <td className="px-4 py-3 text-gray-500">{log.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{log.account_used}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{log.mail_type}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                      {log.status === 'success' ? '성공' : '실패'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-red-500 max-w-[160px] truncate">{log.error_msg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="flex gap-1 justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Button key={p} size="sm" variant={p === page ? 'default' : 'outline'} className="w-8 h-8 p-0 text-xs" onClick={() => setPage(p)}>{p}</Button>
          ))}
        </div>
      )}
    </div>
  )
}
