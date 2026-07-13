'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Mail } from 'lucide-react'

interface SentContact {
  id: number
  company_kr: string
  ceo_name: string
  email: string
  sent_at: string
  account_used: string
}

interface PreviewData {
  subject: string
  html: string
  contact: SentContact
}

export default function Sent() {
  const [contacts, setContacts] = useState<SentContact[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<SentContact | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  const load = async () => {
    const params = new URLSearchParams({ page: String(page), status: 'sent', ...(search && { search }) })
    const r = await fetch(`/api/contacts?${params}`).then(r => r.json())
    setContacts(r.contacts || [])
    setTotal(r.total || 0)
    setTotalPages(r.totalPages || 1)
  }

  useEffect(() => { load() }, [page, search])

  const loadPreview = async (c: SentContact) => {
    setSelected(c)
    setPreview(null)
    setLoadingPreview(true)
    const r = await fetch(`/api/contacts/preview?id=${c.id}`).then(r => r.json())
    setPreview(r)
    setLoadingPreview(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">보낸 메일</h1>
          <p className="text-sm text-gray-500 mt-1">총 {total}건 발송</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="회사명, 이메일 검색"
          className="pl-9 h-9"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* 목록 */}
        <Card className="border-0 shadow-sm w-80 shrink-0 overflow-hidden flex flex-col">
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {contacts.length === 0 && (
              <div className="text-center text-gray-400 py-16 text-sm">발송된 메일 없음</div>
            )}
            {contacts.map(c => (
              <button
                key={c.id}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors ${selected?.id === c.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}
                onClick={() => loadPreview(c)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{c.company_kr}</p>
                    <p className="text-xs text-gray-500 truncate">{c.ceo_name} · {c.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{c.sent_at?.slice(5, 16)}</span>
                </div>
                {c.account_used && (
                  <p className="text-xs text-gray-400 mt-1 truncate">발신: {c.account_used}</p>
                )}
              </button>
            ))}
          </CardContent>
          {totalPages > 1 && (
            <div className="border-t p-2 flex gap-1 justify-center flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} size="sm" variant={p === page ? 'default' : 'outline'} className="w-7 h-7 p-0 text-xs" onClick={() => setPage(p)}>{p}</Button>
              ))}
            </div>
          )}
        </Card>

        {/* 이메일 뷰어 */}
        <Card className="border-0 shadow-sm flex-1 overflow-hidden flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Mail className="w-12 h-12 text-gray-200" />
                <p className="text-sm">왼쪽 목록에서 메일을 선택하세요</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b bg-gray-50/80">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{preview?.subject || '로딩 중...'}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs">{selected.company_kr}</Badge>
                        <span className="text-xs text-gray-500">받는 사람: {selected.ceo_name} &lt;{selected.email}&gt;</span>
                        <span className="text-xs text-gray-400">{selected.sent_at?.slice(0, 16)}</span>
                      </div>
                      {selected.account_used && (
                        <p className="text-xs text-gray-400 mt-1">보낸 계정: {selected.account_used}</p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" onClick={() => setSelected(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {loadingPreview ? (
                    <div className="text-center text-gray-400 py-12 text-sm">로딩 중...</div>
                  ) : preview ? (
                    <iframe
                      srcDoc={preview.html}
                      className="w-full rounded-lg border bg-white"
                      style={{ height: '100%', minHeight: '500px' }}
                      sandbox="allow-same-origin"
                    />
                  ) : null}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
