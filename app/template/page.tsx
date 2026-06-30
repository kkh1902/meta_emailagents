'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, Eye, RotateCcw } from 'lucide-react'

export default function Template() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [preview, setPreview] = useState(false)

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

  const vars = ['{company}', '{company_en}', '{ceo}', '{industry}', '{description}']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">메일 템플릿</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setPreview(!preview)}>
            <Eye className="w-3 h-3 mr-1" />{preview ? '편집' : '미리보기'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.info('기본 템플릿은 설정에서 복원하세요')}>
            <RotateCcw className="w-3 h-3 mr-1" />초기화
          </Button>
          <Button size="sm" onClick={save}><Save className="w-3 h-3 mr-1" />저장</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div><Label className="text-xs font-medium">제목</Label>
                <Input className="mt-1" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div><Label className="text-xs font-medium">본문 (HTML)</Label>
                {preview
                  ? <div className="mt-1 border rounded-lg p-4 min-h-[320px] prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
                  : <Textarea className="mt-1 font-mono text-xs" rows={18} value={body} onChange={e => setBody(e.target.value)} />
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">사용 가능 변수</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {vars.map(v => (
                <div key={v} className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs cursor-pointer hover:bg-gray-100"
                    onClick={() => { setBody(b => b + v); toast.info(`${v} 삽입됨`) }}>{v}</Badge>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-2">클릭하면 본문 끝에 삽입됩니다</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-amber-50">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-amber-800 mb-2">스팸 방지 팁</p>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• 이미지 최소화</li>
                <li>• 링크 1개 이하</li>
                <li>• "무료" "클릭" 키워드 제거</li>
                <li>• 80단어 이하 권장</li>
                <li>• 수신거부 문구 필수</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
