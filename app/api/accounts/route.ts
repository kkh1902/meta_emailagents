import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export function GET() {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  const accounts = db.prepare(`
    SELECT a.*, COUNT(l.id) as sent_today
    FROM accounts a
    LEFT JOIN send_logs l ON l.account_used = a.email AND date(l.sent_at) = ? AND l.status = 'success'
    GROUP BY a.id
  `).all(today)
  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const { email, app_password, daily_limit } = await req.json()
  const db = getDb()
  try {
    db.prepare('INSERT INTO accounts (email, app_password, daily_limit) VALUES (?,?,?)').run(email, app_password, daily_limit || 14)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '이미 등록된 계정입니다' }, { status: 400 })
  }
}
