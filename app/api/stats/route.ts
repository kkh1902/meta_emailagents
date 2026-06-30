import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export function GET() {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  return NextResponse.json({
    total: (db.prepare('SELECT COUNT(*) as c FROM contacts').get() as { c: number }).c,
    sent: (db.prepare("SELECT COUNT(*) as c FROM contacts WHERE status='sent'").get() as { c: number }).c,
    pending: (db.prepare("SELECT COUNT(*) as c FROM contacts WHERE status='pending'").get() as { c: number }).c,
    failed: (db.prepare("SELECT COUNT(*) as c FROM contacts WHERE status='failed'").get() as { c: number }).c,
    today: (db.prepare("SELECT COUNT(*) as c FROM send_logs WHERE date(sent_at)=? AND status='success'").get(today) as { c: number }).c,
    dailyLimit: Number((db.prepare("SELECT value FROM settings WHERE key='daily_limit'").get() as { value: string })?.value || 40),
  })
}
