import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export function POST() {
  const db = getDb()
  db.prepare("INSERT OR REPLACE INTO settings VALUES ('batch_stop', '1')").run()
  return NextResponse.json({ ok: true, message: '다음 발송 후 중단됩니다' })
}
