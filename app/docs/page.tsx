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
• 이 시스템 권장값: 계정당 40개/일`,
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
③ 하루 50개 이하로 발송 — 계정당 분산
④ 텍스트 위주 메일 — HTML 최소화, 링크 1~2개 이하
⑤ 개인화 필수 — {company}, {ceo} 변수로 수신자별 다른 내용
⑥ 워밍업 — 새 계정은 첫 2주간 5→10→20개씩 점진적으로 늘리기
⑦ 수신거부 즉시 처리 — 회신으로 거부 의사 밝히면 contacts에서 제거`,
    },
  ],
}

const strategySection = {
  title: '300개 발송 전략',
  color: 'border-blue-200 bg-blue-50',
  badge: 'text-blue-700 bg-blue-100',
  items: [
    {
      q: '📅 5일 워밍업 플랜 (권장)',
      a: `1일차: 계정당 10개 → 총 60개 (누적 60)
2일차: 계정당 15개 → 총 90개 (누적 150)
3일차: 계정당 20개 → 총 120개 (누적 270)
4일차: 계정당 10개 → 총 60개 (누적 300 ✅)

새 계정은 첫날부터 40개 발송 시 스팸 위험 — 단계적으로 늘릴 것`,
    },
    {
      q: '⏰ 시간대별 계정 순환 방식',
      a: `09시 → metacodea4 (10개)
10시 → metacodea5 (10개)
11시 → metacodea6 (10개)
12시 → metacodea7 (10개)
13시 → metacodea8 (10개)
14시 → support@mcode.co.kr (10개)

→ 하루 60개, 계정마다 1시간 간격으로 분산 발송
→ 동일 IP 동시다발 패턴 방지`,
    },
    {
      q: '🔄 현재 계정 구성',
      a: `support@mcode.co.kr   — 40개/일
metacodea4@gmail.com  — 40개/일
metacodea5@gmail.com  — 40개/일
metacodea6@gmail.com  — 40개/일
metacodea7@gmail.com  — 40개/일
metacodea8@gmail.com  — 40개/일

총 6개 계정 × 40개 = 하루 최대 240개 가능`,
    },
  ],
}

const sections = [
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
      { q: 'Gmail 앱 비밀번호 발급', a: 'Google 계정 → Security & sign-in → 2-Step Verification 활성화 → myaccount.google.com/apppasswords → 앱 이름 입력 → 16자리 비밀번호 생성.' },
      { q: '일일 한도', a: '계정당 기본 40개. 여러 계정 등록 시 한도를 순환하며 분산 발송. 새 계정은 10개부터 시작 권장.' },
      { q: '계정 비활성화', a: '계정 목록에서 active=0으로 설정하면 발송에서 제외.' },
    ],
  },
  {
    title: '스케줄 & 배치',
    color: 'border-green-200 bg-green-50',
    badge: 'text-green-700 bg-green-100',
    items: [
      { q: '배치 시간 설정', a: '현재 설정: 09:00~16:00, 1시간 간격 총 8회. 스케줄 페이지에서 변경 가능.' },
      { q: '즉시 실행', a: '대시보드의 "지금 배치 실행" 버튼으로 스케줄 관계없이 즉시 발송.' },
      { q: '테스트 발송', a: '대시보드의 "테스트" 버튼으로 샘플 메일 발송 확인 가능.' },
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

      {[limitSection, strategySection].map((section) => (
        <Card key={section.title} className="border-0 shadow-sm ring-1 ring-red-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${section.badge}`}>{section.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.q} className={`rounded-lg border p-4 ${section.color}`}>
                  <p className="text-sm font-semibold text-gray-800 mb-2">{item.q}</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.a}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title} className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${section.badge}`}>{section.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
