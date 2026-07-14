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

  const activeTemplateId = (db.prepare("SELECT value FROM settings WHERE key='active_template_id'").get() as { value: string } | undefined)?.value
  const template = db.prepare('SELECT subject, body FROM templates WHERE id = ?').get(Number(activeTemplateId)) as { subject: string; body: string } | undefined

  const subject = renderTemplate(template?.subject || '', contact)
  const html = renderTemplate(template?.body || '', contact)

  return NextResponse.json({ subject, html, contact })
}
