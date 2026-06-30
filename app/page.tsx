'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Send, Users, CheckCircle, Clock, Play, Square, Zap, FlaskConical } from 'lucide-react'

interface Stats { total: number; sent: number; pending: number; failed: number; today: number; dailyLimit: number }
interface Log { id: number; sent_at: string; company: string; email: string; account_used: string; status: string }

const TEST_CONTACT = { name: '김기훈', email: 'hunjyhunji@gmail.com' }

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [scheduleActive, setScheduleActive] = useState(false)
  const [sending, setSending] = useState(false)
  const [testing, setTesting] = useState(false)

  const load = async () => {
    const [s, l, cfg] = await Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/logs?page=1').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ])
    setStats(s)
    setLogs(l.logs?.slice(0, 8) || [])
    setScheduleActive(cfg.schedule_active === '1')
  }

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t) }, [])

  const handleBatch = async () => {
    setSending(true)
    const r = await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ batch: true }) })
    const data = await r.json()
    toast.success(`${data.sent}개 발송 완료`)
    setSending(false)
    load()
  }

  const handleTest = async () => {
    setTesting(true)
    const r = await fetch('/api/send/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CONTACT),
    }).then(r => r.json())
    if (r.success) toast.success(`✅ ${TEST_CONTACT.email} 테스트 발송 완료`)
    else toast.error(`❌ 실패: ${r.error}`)
    setTesting(false)
    load()
  }

  const toggleSchedule = async () => {
    const next = !scheduleActive
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ schedule_active: next ? '1' : '0' }) })
    setScheduleActive(next)
    toast.success(next ? '스케줄 시작됨' : '스케줄 중지됨')
  }

  const pct = stats ? Math.round((stats.sent / (stats.total || 1)) * 100) : 0
  const todayPct = stats ? Math.round((stats.today / (stats.dailyLimit || 40)) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">NextRise 영업 메일 발송 현황</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50" onClick={handleTest} disabled={testing}>
            <FlaskConical className="w-3 h-3 mr-1" />{testing ? '발송 중...' : `테스트 (${TEST_CONTACT.email})`}
          </Button>
          <Button variant={scheduleActive ? 'destructive' : 'default'} size="sm" onClick={toggleSchedule}>
            {scheduleActive ? <><Square className="w-3 h-3 mr-1" />스케줄 중지</> : <><Play className="w-3 h-3 mr-1" />스케줄 시작</>}
          </Button>
          <Button size="sm" variant="outline" onClick={handleBatch} disabled={sending}>
            <Zap className="w-3 h-3 mr-1" />{sending ? '발송 중...' : '지금 배치 실행'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '전체 수신자', value: stats?.total ?? '-', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '발송 완료', value: stats?.sent ?? '-', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '대기 중', value: stats?.pending ?? '-', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: '오늘 발송', value: stats?.today ?? '-', icon: Send, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">전체 진행률</span>
              <span className="text-sm text-gray-500">{stats?.sent} / {stats?.total}</span>
            </div>
            <Progress value={pct} className="h-2 mb-1" />
            <p className="text-xs text-gray-400">{pct}% 완료</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">오늘 발송 현황</span>
              <span className="text-sm text-gray-500">{stats?.today} / {stats?.dailyLimit}</span>
            </div>
            <Progress value={todayPct} className="h-2 mb-1" />
            <p className="text-xs text-gray-400">일일 한도의 {todayPct}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base">최근 발송 로그</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {logs.length === 0 && <p className="text-sm text-gray-400 text-center py-8">발송 기록 없음</p>}
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{log.company}</p>
                  <p className="text-xs text-gray-400">{log.email} · {log.account_used}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-xs text-gray-400">{log.sent_at?.slice(5, 16)}</span>
                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                    {log.status === 'success' ? '성공' : '실패'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
