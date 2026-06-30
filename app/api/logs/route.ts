import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export function GET(req: NextRequest) {
  const db = getDb()
  const page = parseInt(new URL(req.url).searchParams.get('page') || '1')
  const perPage = 100
  const total = (db.prepare('SELECT COUNT(*) as c FROM send_logs').get() as { c: number }).c
  const logs = db.prepare('SELECT * FROM send_logs ORDER BY id DESC LIMIT ? OFFSET ?').all(perPage, (page - 1) * perPage)
  return NextResponse.json({ logs, total, totalPages: Math.ceil(total / perPage) })
}

export function DELETE() {
  getDb().prepare('DELETE FROM send_logs').run()
  return NextResponse.json({ ok: true })
}
