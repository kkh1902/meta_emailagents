import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const limitSection = {
  title: '발송 한도 & 스팸 방지',
  color: 'border-red-200 bg-red-50',
  badge: 'text-red-700 bg-red-100',
  items: [
    {
      q: '📊 Gmail 일일 발송 한도',
      a: `• 개인 Gmail (SMTP): 하루 최대 500개 (메일 클라이언트 경유 시 100개/24h)
• Google Workspace: 하루 최대 2,000개
• 한도 초과 시 1~24시간 후 자동 해제
• 이 프로젝트 기본값: 계정당 14개/일 → 복수 계정으로 분산 권장`,
    },
    {
      q: '⚠️ 스팸 처리 기준 (2024년 2월~ 강화)',
      a: `• 하루 5,000건 이상 발송 시 스팸율 0.3% 초과하면 도메인 영구 차단
• 5,000건 미만이라도 대량 발송자로 분류되어 제재 가능
• HTML 과다 디자인, 첨부파일, 과도한 링크 → 스팸 확률 상승
• 수신거부 미처리 시 지속 신고 → 계정 정지 위험`,
    },
    {
      q: '✅ 스팸 안 걸리는 핵심 방법',
      a: `① SPF 레코드 설정 — 도메인 DNS에 Gmail 인증 레코드 추가
② DKIM 서명 활성화 — Google Workspace에서 설정
③ 하루 50개 이하로 발송 — 계정당 분산 (이 시스템 기본값 14개가 안전)
④ 텍스트 위주 메일 — HTML 최소화, 링크 1~2개 이하
⑤ 개인화 필수 — {company}, {ceo} 변수로 수신자별 다른 내용
⑥ 워밍업 — 새 계정은 첫 2주간 5→10→20개씩 점진적으로 늘리기
⑦ 수신거부 즉시 처리 — 회신으로 거부 의사 밝히면 contacts에서 제거`,
    },
    {
      q: '🔒 기술 인증 설정 (SPF/DKIM)',
      a: `SPF: DNS TXT 레코드에 "v=spf1 include:_spf.google.com ~all" 추가
DKIM: Google Workspace 관리콘솔 → 앱 → Gmail → 이메일 인증 → DKIM 설정
미설정 시 수신함 대신 스팸함으로 자동 분류될 수 있음`,
    },
  ],
}

const sections = [
  {
    title: '시작하기',
    color: 'border-blue-200 bg-blue-50',
    badge: 'text-blue-700 bg-blue-100',
    items: [
      { q: '환경 설정', a: 'Python 가상환경 생성 후 `pip install -r requirements.txt` 실행. FastAPI 서버는 `uvicorn app:app --reload --port 8000`으로 시작.' },
      { q: 'Next.js 대시보드', a: '`web/` 폴더에서 `npm install && npm run dev` 실행. 기본 포트 3000.' },
      { q: 'DB 초기화', a: '서버 최초 실행 시 `email_agent.db` 자동 생성. 수동 초기화는 `database.py`의 `init_db()` 호출.' },
    ],
  },
  {
    title: '수신자 관리',
    color: 'border-violet-200 bg-violet-50',
    badge: 'text-violet-700 bg-violet-100',
    items: [
      { q: 'Excel 업로드', a: '수신자 목록 페이지에서 .xlsx 파일 업로드. 컬럼: company_kr, company_en, ceo_name, email, industry, booth_category, description.' },
      { q: '상태 값', a: '`pending` (대기) → `sent` (발송 완료) / `failed` (실패). 재발송은 상태를 pending으로 변경.' },
      { q: '바운스 처리', a: '`bounced=1`인 수신자는 발송에서 자동 제외됨.' },
    ],
  },
  {
    title: '발송 계정',
    color: 'border-amber-200 bg-amber-50',
    badge: 'text-amber-700 bg-amber-100',
    items: [
      { q: 'Gmail 앱 비밀번호', a: 'Google 계정 → 보안 → 2단계 인증 활성화 → 앱 비밀번호 생성. 일반 비밀번호 사용 불가.' },
      { q: '일일 한도', a: '계정당 기본 14개. 여러 계정 등록 시 한도를 순환하며 분산 발송. 전체 한도는 settings에서 조정.' },
      { q: '계정 비활성화', a: '계정 목록에서 active=0으로 설정하면 발송에서 제외.' },
    ],
  },
  {
    title: '스케줄 & 배치',
    color: 'border-green-200 bg-green-50',
    badge: 'text-green-700 bg-green-100',
    items: [
      { q: '배치 시간 설정', a: '스케줄 페이지에서 발송 시간 설정 (예: 09:00, 11:00, 14:00). 설정한 시간마다 자동 배치 실행.' },
      { q: '즉시 실행', a: '대시보드의 "지금 배치 실행" 버튼으로 스케줄 관계없이 즉시 발송.' },
      { q: '테스트 발송', a: '대시보드의 "테스트" 버튼으로 kkh1902@naver.com에 샘플 메일 발송 확인 가능.' },
    ],
  },
  {
    title: '메일 템플릿',
    color: 'border-rose-200 bg-rose-50',
    badge: 'text-rose-700 bg-rose-100',
    items: [
      { q: '변수 치환', a: '`{company}`, `{ceo}`, `{industry}` 변수가 수신자 데이터로 자동 치환됨.' },
      { q: 'HTML 지원', a: '템플릿은 HTML 형식으로 작성 가능. 인라인 스타일 권장 (Gmail 호환성).' },
      { q: '제목 변수', a: '이메일 제목에도 `{company}` 등 동일한 변수 사용 가능.' },
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">문서</h1>
        <p className="text-sm text-gray-500 mt-1">Email Agent 사용 가이드</p>
      </div>

      {/* 발송 한도 & 스팸 방지 — 상단 고정 */}
      <Card className="border-0 shadow-sm ring-1 ring-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${limitSection.badge}`}>{limitSection.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {limitSection.items.map((item) => (
              <div key={item.q} className={`rounded-lg border p-4 ${limitSection.color}`}>
                <p className="text-sm font-semibold text-gray-800 mb-2">{item.q}</p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title} className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${section.badge}`}>{section.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className={`rounded-b-xl`}>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.q} className={`rounded-lg border p-4 ${section.color}`}>
                    <p className="text-sm font-semibold text-gray-800 mb-1">{item.q}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
