'use client'
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Upload, Trash2, Search, Send } from 'lucide-react'

interface Contact { id: number; company_kr: string; ceo_name: string; email: string; industry: string; status: string; sent_at: string; bounced: number }

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const params = new URLSearchParams({ page: String(page), ...(status && { status }), ...(search && { search }) })
    const r = await fetch(`/api/contacts?${params}`).then(r => r.json())
    setContacts(r.contacts || [])
    setTotal(r.total || 0)
    setTotalPages(r.totalPages || 1)
  }

  useEffect(() => { load() }, [page, status, search])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/contacts', { method: 'POST', body: fd }).then(r => r.json())
    toast.success(`✅ ${r.imported}개 가져오기 완료 (제외: ${r.skipped}개)`)
    setUploading(false)
    load()
  }

  const handleReset = async () => {
    if (!confirm('전체 수신자를 삭제하시겠습니까?')) return
    await fetch('/api/contacts', { method: 'DELETE' })
    toast.success('초기화 완료')
    load()
  }

  const handleSendOne = async (id: number) => {
    const r = await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: id }) }).then(r => r.json())
    if (r.success) toast.success('발송 완료')
    else toast.error(r.error || '발송 실패')
    load()
  }

  const statusBadge = (c: Contact) => {
    if (c.bounced) return <Badge variant="secondary">반송</Badge>
    if (c.status === 'sent') return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">발송완료</Badge>
    if (c.status === 'failed') return <Badge variant="destructive">실패</Badge>
    return <Badge variant="outline" className="text-amber-600 border-amber-300">대기</Badge>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">수신자 목록</h1>
          <p className="text-sm text-gray-500 mt-1">총 {total}개</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={handleUpload} />
          <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="w-3 h-3 mr-1" />{uploading ? '업로드 중...' : 'Excel 업로드'}
          </Button>
          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={handleReset}>
            <Trash2 className="w-3 h-3 mr-1" />초기화
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="회사명, 이메일 검색" className="pl-9 h-9" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(!v || v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="전체 상태" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">대기 중</SelectItem>
            <SelectItem value="sent">발송 완료</SelectItem>
            <SelectItem value="failed">실패</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/80">
                <th className="text-left px-5 py-3 font-medium text-gray-600 text-xs">회사명</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">대표자</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">이메일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs hidden lg:table-cell">업종</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">발송일</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-12">수신자 없음. Excel 파일을 업로드하세요.</td></tr>
              )}
              {contacts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium">{c.company_kr}</td>
                  <td className="px-4 py-3 text-gray-600">{c.ceo_name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email}</td>
                  <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs max-w-[160px] truncate">{c.industry}</td>
                  <td className="px-4 py-3">{statusBadge(c)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.sent_at?.slice(0, 16) || '-'}</td>
                  <td className="px-4 py-3">
                    {c.status === 'pending' && !c.bounced && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleSendOne(c.id)}>
                        <Send className="w-3 h-3 mr-1" />발송
                      </Button>
                    )}
                  </td>
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
