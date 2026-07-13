import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { company_kr, ceo_name, email } = await req.json()
  if (!email || !company_kr) return NextResponse.json({ ok: false, error: '회사명과 이메일은 필수입니다' }, { status: 400 })

  const db = getDb()
  const existing = db.prepare('SELECT id FROM contacts WHERE email = ?').get(email)
  if (existing) return NextResponse.json({ ok: false, error: '이미 등록된 이메일입니다' }, { status: 400 })

  db.prepare("INSERT INTO contacts (company_kr, ceo_name, email, status, bounced) VALUES (?, ?, ?, 'pending', 0)")
    .run(company_kr, ceo_name || null, email)

  return NextResponse.json({ ok: true })
}
