'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Save, Plus, Check, Trash2 } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { EditorView } from '@codemirror/view'

const growTheme = EditorView.theme({
  '&': { height: 'auto' },
  '.cm-scroller': { overflow: 'visible' },
})

interface TemplateMeta { id: number; name: string }

export default function Template() {
  const [templates, setTemplates] = useState<TemplateMeta[]>([])
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [iframeHeight, setIframeHeight] = useState(600)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleIframeLoad = () => {
    const doc = iframeRef.current?.contentDocument
    if (doc?.documentElement) setIframeHeight(doc.documentElement.scrollHeight + 20)
  }

  const loadList = async () => {
    const d = await fetch('/api/templates').then(r => r.json())
    setTemplates(d.templates || [])
    setActiveTemplateId(d.activeTemplateId ?? null)
    return d as { templates: TemplateMeta[]; activeTemplateId: number | null }
  }

  const loadTemplate = async (id: number) => {
    const d = await fetch(`/api/templates?id=${id}`).then(r => r.json())
    setSelectedId(id)
    setSubject(d.subject || '')
    setBody(d.body || '')
  }

  useEffect(() => {
    loadList().then(d => {
      const initial = d.activeTemplateId ?? d.templates[0]?.id
      if (initial) loadTemplate(initial)
    })
  }, [])

  const save = async () => {
    if (!selectedId) return
    await fetch('/api/templates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId, subject, body }) })
    toast.success('템플릿 저장 완료')
  }

  const activate = async () => {
    if (!selectedId) return
    await fetch('/api/templates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId, setActive: true }) })
    setActiveTemplateId(selectedId)
    toast.success('발송용 템플릿으로 전환했습니다')
  }

  const createNew = async () => {
    const nextNum = templates.length + 1
    const name = `템플릿 ${nextNum}`
    const d = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, cloneFromId: selectedId }),
    }).then(r => r.json())
    await loadList()
    await loadTemplate(d.id)
    toast.success(`${name} 생성 완료 (현재 템플릿 복사)`)
  }

  const deleteTemplate = async (id: number, name: string) => {
    if (templates.length <= 1) return toast.error('마지막 템플릿은 삭제할 수 없습니다')
    if (!confirm(`"${name}" 템플릿을 삭제할까요?`)) return

    const res = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' }).then(r => r.json())
    if (res.error) return toast.error(res.error)

    const d = await loadList()
    if (selectedId === id) {
      const next = d.activeTemplateId ?? d.templates[0]?.id
      if (next) await loadTemplate(next)
    }
    toast.success(`"${name}" 삭제 완료`)
  }

  // 미리보기 전용: cid: 참조는 브라우저에서 해석되지 않으므로 public/ 정적 경로로 치환
  const previewHtml = useMemo(() => (
    body
      .replace(/cid:ii_mqjfv69w0/g, '/images/biz/bz_1.png')
      .replace(/cid:ii_mqjfv6a81/g, '/images/biz/bz_2.png')
      .replace(/cid:ii_card_kangseungyoon/g, '/images/biz/대표님_명함.png')
  ), [body])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">메일 템플릿</h1>
        <div className="flex gap-2">
          {selectedId !== activeTemplateId && (
            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={activate}>
              <Check className="w-3 h-3 mr-1" />발송용으로 지정
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            disabled={templates.length <= 1}
            onClick={() => {
              const t = templates.find(t => t.id === selectedId)
              if (t) deleteTemplate(t.id, t.name)
            }}
          >
            <Trash2 className="w-3 h-3 mr-1" />삭제
          </Button>
          <Button size="sm" onClick={save}><Save className="w-3 h-3 mr-1" />저장</Button>
        </div>
      </div>

      {/* 템플릿 탭 */}
      <div className="flex items-center gap-2 flex-wrap">
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => loadTemplate(t.id)}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-1.5 ${
              selectedId === t.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.name}
            {activeTemplateId === t.id && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedId === t.id ? 'bg-blue-500' : 'bg-green-100 text-green-700'}`}>
                사용중
              </span>
            )}
          </button>
        ))}
        <Button size="sm" variant="outline" onClick={createNew}>
          <Plus className="w-3 h-3 mr-1" />새 템플릿
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_1.5fr] gap-5 items-start">
        {/* 편집 */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div>
              <Label className="text-xs font-medium">제목</Label>
              <Input className="mt-1" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium">본문 (HTML)</Label>
              <div className="mt-1 rounded-lg border border-input text-xs">
                <CodeMirror
                  value={body}
                  minHeight="600px"
                  extensions={[html(), growTheme]}
                  onChange={value => setBody(value)}
                  basicSetup={{ lineNumbers: true, foldGutter: true }}
                />
              </div>
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
                ref={iframeRef}
                srcDoc={previewHtml}
                onLoad={handleIframeLoad}
                className="w-full border rounded-lg bg-white"
                style={{ height: iframeHeight }}
                sandbox="allow-same-origin"
              />
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
