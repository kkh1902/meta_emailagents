import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const layers = [
  {
    color: 'bg-blue-500',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    label: 'UI Layer',
    title: 'Next.js 대시보드',
    items: ['대시보드', '수신자 목록', '발송 계정', '메일 템플릿', '스케줄', '발송 로그'],
  },
  {
    color: 'bg-violet-500',
    border: 'border-violet-200',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    label: 'API Layer',
    title: 'FastAPI 백엔드',
    items: ['/api/stats', '/api/send', '/api/contacts', '/api/settings', '/api/logs'],
  },
  {
    color: 'bg-amber-500',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    label: 'Service Layer',
    title: '서비스 모듈',
    items: ['scheduler_service.py — 배치 스케줄', 'sender.py — Gmail 발송', 'database.py — SQLite 연결'],
  },
  {
    color: 'bg-green-500',
    border: 'border-green-200',
    bg: 'bg-green-50',
    text: 'text-green-700',
    label: 'Data Layer',
    title: 'SQLite DB',
    items: ['contacts — 수신자', 'accounts — 발신 계정', 'send_logs — 발송 기록', 'settings — 설정'],
  },
]

const flow = [
  { icon: '⏰', label: '스케줄 트리거', desc: '설정된 시간에 배치 시작' },
  { icon: '🔍', label: 'pending 조회', desc: 'contacts 테이블에서 미발송 수신자 선택' },
  { icon: '📤', label: '발송 계정 선택', desc: '일일 한도 내 계정 순환 배분' },
  { icon: '✉️', label: 'Gmail SMTP', desc: '템플릿 변수 치환 후 발송' },
  { icon: '📝', label: '로그 기록', desc: 'send_logs에 성공/실패 저장' },
]

export default function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">아키텍처</h1>
        <p className="text-sm text-gray-500 mt-1">시스템 구성 및 데이터 흐름</p>
      </div>

      {/* 레이어 다이어그램 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4"><CardTitle className="text-base">시스템 레이어</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {layers.map((layer, i) => (
            <div key={i}>
              <div className={`rounded-xl border ${layer.border} ${layer.bg} p-4`}>
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${layer.color} shrink-0 mt-2`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${layer.bg} ${layer.text} border ${layer.border}`}>
                        {layer.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">{layer.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {layer.items.map((item, j) => (
                        <span key={j} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-md">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-1 text-gray-300 text-lg">↓</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 발송 흐름 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4"><CardTitle className="text-base">발송 흐름</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 overflow-x-auto pb-2">
            {flow.map((step, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-2 mx-auto">
                    {step.icon}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 whitespace-nowrap">{step.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 max-w-[100px] text-center leading-tight">{step.desc}</p>
                </div>
                {i < flow.length - 1 && <div className="text-gray-300 text-xl mb-6 shrink-0">→</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DB 스키마 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4"><CardTitle className="text-base">DB 스키마</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'contacts', color: 'border-blue-200 bg-blue-50', fields: ['id', 'email', 'company_kr', 'ceo_name', 'industry', 'status', 'sent_at', 'bounced'] },
              { name: 'accounts', color: 'border-violet-200 bg-violet-50', fields: ['id', 'email', 'app_password', 'daily_limit', 'active'] },
              { name: 'send_logs', color: 'border-amber-200 bg-amber-50', fields: ['id', 'contact_id', 'email', 'company', 'account_used', 'mail_type', 'status', 'sent_at'] },
              { name: 'settings', color: 'border-green-200 bg-green-50', fields: ['key', 'value'] },
            ].map((table) => (
              <div key={table.name} className={`rounded-xl border ${table.color} p-4`}>
                <p className="text-xs font-bold text-gray-700 mb-2 font-mono">{table.name}</p>
                <div className="space-y-1">
                  {table.fields.map((f) => (
                    <p key={f} className="text-[11px] text-gray-500 font-mono">· {f}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
