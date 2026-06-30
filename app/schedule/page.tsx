'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Play, Square, Clock } from 'lucide-react'

export default function Schedule() {
  const [settings, setSettings] = useState({ daily_limit: '40', batch_times: '09:00,11:00,13:00,15:00', schedule_active: '0' })

  useEffect(() => { fetch('/api/settings').then(r => r.json()).then(setSettings) }, [])

  const save = async () => {
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    toast.success('설정 저장 완료')
  }

  const toggle = async () => {
    const next = settings.schedule_active === '1' ? '0' : '1'
    const newSettings = { ...settings, schedule_active: next }
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSettings) })
    setSettings(newSettings)
    toast.success(next === '1' ? '스케줄 시작' : '스케줄 중지')
  }

  const isActive = settings.schedule_active === '1'
  const times = settings.batch_times.split(',').map(t => t.trim()).filter(Boolean)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">발송 스케줄</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">스케줄 설정</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">하루 최대 발송 수</Label>
              <Input type="number" className="mt-1" value={settings.daily_limit}
                onChange={e => setSettings(s => ({...s, daily_limit: e.target.value}))} min={1} max={120} />
              <p className="text-xs text-gray-400 mt-1">계정 3개 기준 최대 42개 권장</p>
            </div>
            <div>
              <Label className="text-xs">배치 실행 시간 (쉼표 구분)</Label>
              <Input className="mt-1 font-mono" value={settings.batch_times}
                onChange={e => setSettings(s => ({...s, batch_times: e.target.value}))} placeholder="09:00,11:00,13:00,15:00" />
              <p className="text-xs text-gray-400 mt-1">배치당 최대 10개, 6분 간격 발송</p>
            </div>
            <Button className="w-full" onClick={save}>저장</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span className="font-medium text-sm">{isActive ? '실행 중' : '중지됨'}</span>
                  <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">{isActive ? 'ON' : 'OFF'}</Badge>
                </div>
                <Button size="sm" variant={isActive ? 'destructive' : 'default'} onClick={toggle}>
                  {isActive ? <><Square className="w-3 h-3 mr-1" />중지</> : <><Play className="w-3 h-3 mr-1" />시작</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4" />오늘 발송 타임라인</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 w-14">{t}</span>
                  <div className="flex-1 bg-blue-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '100%'}} />
                  </div>
                  <span className="text-xs text-gray-400">10개</span>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">총 {times.length * 10}개/일 (배치 {times.length}회)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
