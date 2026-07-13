'use client'
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Upload, Trash2, Search, Send, Eye, X, RefreshCw, PlayCircle, StopCircle, UserPlus } from 'lucide-react'

interface Contact { id: number; company_kr: string; ceo_name: string; email: string; industry: string; status: string; sent_at: string; account_used: string; bounced: number }

interface PreviewData { subject: string; html: string; contact: Contact }

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState<number | null>(null)
  const [batchRunning, setBatchRunning] = useState(false)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ company_kr: '', ceo_name: '', email: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const params = new URLSearchParams({ page: String(page), ...(status && { status }), ...(search && { search }) })
    const r = await fetch(`/api/contacts?${params}`).then(r => r.json())
    setContacts(r.contacts || [])
    setTotal(r.total || 0)
    setTotalPages(r.totalPages || 1)
  }

  useEffect(() => { load() }, [page, status, search])

  useEffect(() => {
    const timer = setInterval(async () => {
      const r = await fetch('/api/send/status').then(r => r.json())
      setBatchRunning(r.running)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/contacts', { method: 'POST', body: fd }).then(r => r.json())
    toast.success(`✅ ${r.imported}개 가져오기 완료 (제외: ${r.skipped}개)`)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    load()
  }

  const handleReset = async () => {
    if (!confirm('전체 수신자를 삭제하시겠습니까?')) return
    await fetch('/api/contacts', { method: 'DELETE' })
    toast.success('초기화 완료')
    load()
  }

  const handleBatch = async () => {
    setBatchRunning(true)
    const r = await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ batch: true }) }).then(r => r.json())
    if (r.sent > 0) toast.success(`✅ ${r.sent}건 발송 완료`)
    else toast.info(r.message || '발송할 대기 건이 없습니다')
    setBatchRunning(false)
    load()
  }

  const handleStop = async () => {
    await fetch('/api/send/stop', { method: 'POST' })
    toast.warning('⏹ 중단 요청됨 — 현재 발송 완료 후 멈춥니다')
  }

  const handleSendOne = async (id: number) => {
    setSending(id)
    const r = await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: id }) }).then(r => r.json())
    if (r.success) toast.success('발송 완료')
    else toast.error(r.error || '발송 실패')
    setSending(null)
    load()
  }

  const handleAdd = async () => {
    if (!addForm.email) return toast.error('이메일을 입력하세요')
    if (!addForm.company_kr) return toast.error('회사명을 입력하세요')
    const r = await fetch('/api/contacts/single', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addForm) }).then(r => r.json())
    if (r.ok) { toast.success('추가 완료'); setAddModal(false); setAddForm({ company_kr: '', ceo_name: '', email: '' }); load() }
    else toast.error(r.error || '추가 실패')
  }

  const handlePreview = async (id: number) => {
    const r = await fetch(`/api/contacts/preview?id=${id}`).then(r => r.json())
    if (r.subject) setPreview(r)
  }

  const statusBadge = (c: Contact) => {
    if (c.bounced) return <Badge variant="secondary">반송</Badge>
    if (c.status === 'sent') return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">발송완료</Badge>
    if (c.status === 'failed') return <Badge variant="destructive">실패</Badge>
    return <Badge variant="outline" className="text-amber-600 border-amber-300">대기</Badge>
  }

  const canSend = (c: Contact) => !c.bounced && (c.status === 'pending' || c.status === 'failed')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">수신자 목록</h1>
          <p className="text-sm text-gray-500 mt-1">총 {total}개</p>
        </div>
        <div className="flex gap-2">
          {batchRunning ? (
            <Button onClick={handleStop} className="bg-red-500 hover:bg-red-600 text-white" size="sm">
              <StopCircle className="w-3 h-3 mr-1" />발송 중단
            </Button>
          ) : (
            <Button onClick={handleBatch} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
              <PlayCircle className="w-3 h-3 mr-1" />자동 발송 (120개)
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setAddModal(true)}>
            <UserPlus className="w-3 h-3 mr-1" />수동 추가
          </Button>
          <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={handleUpload} />
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
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
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[10%]" />
              <col className="w-[22%]" />
              <col className="w-[15%] hidden xl:table-column" />
              <col className="w-[9%]" />
              <col className="w-[14%] hidden lg:table-column" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="border-b bg-gray-50/80">
                <th className="text-left px-5 py-3 font-medium text-gray-600 text-xs">회사명</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">대표자</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">이메일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs hidden xl:table-cell">업종</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs hidden lg:table-cell">발송 계정</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">발송일</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-12">수신자 없음. Excel 파일을 업로드하세요.</td></tr>
              )}
              {contacts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium truncate">{c.company_kr}</td>
                  <td className="px-4 py-3 text-gray-600 truncate">{c.ceo_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate">{c.email}</td>
                  <td className="px-4 py-3 text-gray-400 hidden xl:table-cell text-xs truncate">{c.industry}</td>
                  <td className="px-4 py-3">{statusBadge(c)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {c.account_used
                      ? <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{c.account_used.split('@')[0]}</span>
                      : <span className="text-xs text-gray-300">-</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{c.sent_at?.slice(0, 16) || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700" onClick={() => handlePreview(c.id)} title="이메일 미리보기">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {canSend(c) && (
                        <Button
                          size="sm"
                          variant={c.status === 'failed' ? 'outline' : 'ghost'}
                          className={`h-7 text-xs px-2 ${c.status === 'failed' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-blue-600 hover:bg-blue-50'}`}
                          onClick={() => handleSendOne(c.id)}
                          disabled={sending === c.id}
                        >
                          {sending === c.id
                            ? <RefreshCw className="w-3 h-3 animate-spin" />
                            : c.status === 'failed'
                              ? <><RefreshCw className="w-3 h-3 mr-1" />재발송</>
                              : <><Send className="w-3 h-3 mr-1" />발송</>
                          }
                        </Button>
                      )}
                    </div>
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

      {/* 이메일 미리보기 모달 */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">수신: {preview.contact.email} ({preview.contact.company_kr} / {preview.contact.ceo_name})</p>
                <p className="font-semibold text-gray-900 text-sm">{preview.subject}</p>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setPreview(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <iframe
                srcDoc={preview.html}
                className="w-full border rounded-lg"
                style={{ height: '600px' }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}
      {/* 수동 추가 모달 */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setAddModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">수신자 추가</h3>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setAddModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">회사명 *</label>
                <Input value={addForm.company_kr} onChange={e => setAddForm(f => ({ ...f, company_kr: e.target.value }))} placeholder="회사명" className="h-9" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">대표자</label>
                <Input value={addForm.ceo_name} onChange={e => setAddForm(f => ({ ...f, ceo_name: e.target.value }))} placeholder="대표자명" className="h-9" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">이메일 *</label>
                <Input value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="email@company.com" className="h-9" />
              </div>
              <Button onClick={handleAdd} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">추가</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
