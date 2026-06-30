import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export function GET() {
  const db = getDb()
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  return NextResponse.json(Object.fromEntries(rows.map(r => [r.key, r.value])))
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const db = getDb()
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  for (const [key, value] of Object.entries(data)) {
    upsert.run(key, String(value))
  }
  return NextResponse.json({ ok: true })
}
