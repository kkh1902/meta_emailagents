import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export function GET() {
  const db = getDb()
  const running = (db.prepare("SELECT value FROM settings WHERE key='batch_running'").get() as { value: string })?.value
  return NextResponse.json({ running: running === '1' })
}
