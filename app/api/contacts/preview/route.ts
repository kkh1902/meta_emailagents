import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { renderTemplate } from '@/lib/mailer'

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const db = getDb()
  const contact = db.prepare('SELECT * FROM contacts WHERE id=?').get(Number(id)) as Record<string, string | null> | undefined
  if (!contact) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const settings = Object.fromEntries(
    (db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]).map(r => [r.key, r.value])
  )

  const subject = renderTemplate(settings.email_subject || '', contact)
  const html = renderTemplate(settings.email_body || '', contact)

  return NextResponse.json({ subject, html, contact })
}
