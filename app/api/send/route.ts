import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sendToContact } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  const { contactId, batch } = await req.json()

  if (contactId) {
    const result = await sendToContact(Number(contactId))
    return NextResponse.json(result)
  }

  if (batch) {
    const db = getDb()
    const today = new Date().toISOString().split('T')[0]
    const dailyLimit = Number((db.prepare("SELECT value FROM settings WHERE key='daily_limit'").get() as { value: string })?.value || 40)
    const sentToday = (db.prepare("SELECT COUNT(*) as c FROM send_logs WHERE date(sent_at)=? AND status='success'").get(today) as { c: number }).c
    const remaining = Math.min(10, dailyLimit - sentToday)
    if (remaining <= 0) return NextResponse.json({ ok: true, sent: 0, message: '오늘 한도 도달' })

    const pending = db.prepare("SELECT id FROM contacts WHERE status='pending' AND bounced=0 LIMIT ?").all(remaining) as { id: number }[]

    let sent = 0
    for (const { id } of pending) {
      const result = await sendToContact(id)
      if (result.success) sent++
    }
    return NextResponse.json({ ok: true, sent })
  }

  return NextResponse.json({ error: 'Bad request' }, { status: 400 })
}
