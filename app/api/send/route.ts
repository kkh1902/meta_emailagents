import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sendToContact } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  const { contactId, batch } = await req.json()

  if (contactId != null) {
    const result = await sendToContact(Number(contactId))
    return NextResponse.json(result)
  }

  if (batch) {
    const db = getDb()

    // 이미 배치 실행 중이면 거부
    const running = (db.prepare("SELECT value FROM settings WHERE key='batch_running'").get() as { value: string })?.value
    if (running === '1') return NextResponse.json({ ok: false, error: '이미 발송 중입니다' })
    db.prepare("INSERT OR REPLACE INTO settings VALUES ('batch_running', '1')").run()

    const today = new Date().toISOString().split('T')[0]
    const sentToday = (db.prepare("SELECT COUNT(*) as c FROM send_logs WHERE date(sent_at)=? AND status='success'").get(today) as { c: number }).c
    const activeAccounts = db.prepare('SELECT daily_limit FROM accounts WHERE active=1').all() as { daily_limit: number }[]
    const batchSize = activeAccounts.reduce((sum, a) => sum + a.daily_limit, 0)
    const dailyLimit = batchSize
    const remaining = Math.min(batchSize, dailyLimit - sentToday)
    if (remaining <= 0) return NextResponse.json({ ok: true, sent: 0, message: '오늘 한도 도달' })

    const pending = db.prepare("SELECT id FROM contacts WHERE status='pending' AND bounced=0 LIMIT ?").all(remaining) as { id: number }[]

    // 계정을 id 순서대로 순환 배정 (support → a4 → a5 → a6 → a7 → a8 → support → ...)
    const accounts = db.prepare('SELECT email, daily_limit FROM accounts WHERE active=1 ORDER BY id ASC').all() as { email: string; daily_limit: number }[]
    if (accounts.length === 0) return NextResponse.json({ ok: false, error: '활성 계정 없음' })

    const delay = Number((db.prepare("SELECT value FROM settings WHERE key='send_delay'").get() as { value: string })?.value || 0) * 1000

    // 시작 전 중단 플래그 초기화
    db.prepare("INSERT OR REPLACE INTO settings VALUES ('batch_stop', '0')").run()

    let sent = 0
    try {
    for (let i = 0; i < pending.length; i++) {
      // 매 발송 전 중단 플래그 확인
      const stopFlag = (db.prepare("SELECT value FROM settings WHERE key='batch_stop'").get() as { value: string })?.value
      if (stopFlag === '1') break

      const accountEmail = accounts[i % accounts.length].email
      const result = await sendToContact(pending[i].id, accountEmail)
      if (result.success) sent++

      if (delay > 0 && i < pending.length - 1) {
        const interval = 500
        let elapsed = 0
        while (elapsed < delay) {
          await new Promise(r => setTimeout(r, interval))
          elapsed += interval
          const flag = (db.prepare("SELECT value FROM settings WHERE key='batch_stop'").get() as { value: string })?.value
          if (flag === '1') break
        }
      }
    }

    } finally {
      db.prepare("INSERT OR REPLACE INTO settings VALUES ('batch_stop', '0')").run()
      db.prepare("INSERT OR REPLACE INTO settings VALUES ('batch_running', '0')").run()
    }
    return NextResponse.json({ ok: true, sent })
  }

  return NextResponse.json({ error: 'Bad request' }, { status: 400 })
}
