'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Trash2, Plus, Shield } from 'lucide-react'

interface Account { id: number; email: string; daily_limit: number; active: number; sent_today: number }

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [form, setForm] = useState({ email: '', app_password: '', daily_limit: 14 })

  const load = async () => setAccounts(await fetch('/api/accounts').then(r => r.json()))
  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const r = await fetch('/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => r.json())
    if (r.ok) { toast.success('계정 추가 완료'); setForm({ email: '', app_password: '', daily_limit: 14 }); load() }
    else toast.error(r.error)
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
    toast.success('계정 삭제됨'); load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">발송 계정</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4" />계정 추가</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div><Label className="text-xs">Gmail 주소</Label><Input placeholder="account@company.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required /></div>
                <div><Label className="text-xs">앱 비밀번호</Label><Input type="password" placeholder="xxxx xxxx xxxx xxxx" value={form.app_password} onChange={e => setForm(f => ({...f, app_password: e.target.value}))} required />
                  <p className="text-xs text-gray-400 mt-1">Google 계정 → 보안 → 앱 비밀번호</p></div>
                <div><Label className="text-xs">일일 한도</Label><Input type="number" min={1} max={40} value={form.daily_limit} onChange={e => setForm(f => ({...f, daily_limit: Number(e.target.value)}))} /></div>
                <Button type="submit" className="w-full">추가</Button>
              </form>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-blue-600" /><span className="text-sm font-medium text-blue-800">앱 비밀번호 생성</span></div>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Google 계정 → <strong>보안</strong></li>
                <li>2단계 인증 활성화 (필수)</li>
                <li><strong>앱 비밀번호</strong> 클릭</li>
                <li>앱: 메일 / 기기: 기타</li>
                <li>생성된 16자리 비밀번호 복사</li>
              </ol>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">등록된 계정 ({accounts.length}개)</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {accounts.length === 0 && <p className="text-sm text-gray-400 text-center py-8">등록된 계정 없음</p>}
                {accounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-sm">{acc.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">오늘 {acc.sent_today}개 발송 / 한도 {acc.daily_limit}개</p>
                      <div className="w-full bg-gray-100 rounded-full h-1 mt-2" style={{maxWidth: 160}}>
                        <div className="bg-blue-500 h-1 rounded-full" style={{width: `${Math.min((acc.sent_today/acc.daily_limit)*100, 100)}%`}} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={acc.active ? 'default' : 'secondary'} className="text-xs">{acc.active ? '활성' : '비활성'}</Badge>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500" onClick={() => handleDelete(acc.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
