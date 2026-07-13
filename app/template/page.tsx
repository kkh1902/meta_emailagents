'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Save, RotateCcw } from 'lucide-react'

export default function Template() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setSubject(d.email_subject || '')
      setBody(d.email_body || '')
    })
  }, [])

  const save = async () => {
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email_subject: subject, email_body: body }) })
    toast.success('템플릿 저장 완료')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">메일 템플릿</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.info('기본 템플릿은 설정에서 복원하세요')}>
            <RotateCcw className="w-3 h-3 mr-1" />초기화
          </Button>
          <Button size="sm" onClick={save}><Save className="w-3 h-3 mr-1" />저장</Button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1.5fr] gap-5">
        {/* 편집 */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div>
              <Label className="text-xs font-medium">제목</Label>
              <Input className="mt-1" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium">본문 (HTML)</Label>
              <Textarea className="mt-1 font-mono text-xs" rows={22} value={body} onChange={e => setBody(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* 미리보기 */}
        <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-600">미리보기</CardTitle>
              <p className="text-xs text-gray-400">제목: {subject}</p>
            </CardHeader>
            <CardContent className="p-5">
              <iframe
                srcDoc={body}
                className="w-full border rounded-lg bg-white"
                style={{ minHeight: '600px', height: '700px' }}
                sandbox="allow-same-origin"
              />
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
