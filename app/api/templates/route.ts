import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export function GET(req: NextRequest) {
  const db = getDb()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const tpl = db.prepare('SELECT * FROM templates WHERE id = ?').get(Number(id))
    if (!tpl) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json(tpl)
  }

  const activeId = (db.prepare("SELECT value FROM settings WHERE key='active_template_id'").get() as { value: string } | undefined)?.value
  const list = db.prepare('SELECT id, name FROM templates ORDER BY id').all()
  return NextResponse.json({ templates: list, activeTemplateId: activeId ? Number(activeId) : null })
}

export async function POST(req: NextRequest) {
  const { name, subject, body, cloneFromId } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const db = getDb()

  let finalSubject = subject || ''
  let finalBody = body || ''
  if (cloneFromId) {
    const source = db.prepare('SELECT subject, body FROM templates WHERE id = ?').get(Number(cloneFromId)) as { subject: string; body: string } | undefined
    if (source) { finalSubject = source.subject; finalBody = source.body }
  }

  const info = db.prepare('INSERT INTO templates (name, subject, body) VALUES (?, ?, ?)').run(name, finalSubject, finalBody)
  return NextResponse.json({ ok: true, id: info.lastInsertRowid })
}

export async function PUT(req: NextRequest) {
  const { id, name, subject, body, setActive } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const db = getDb()

  const fields: string[] = []
  const values: (string | number)[] = []
  if (name !== undefined) { fields.push('name = ?'); values.push(name) }
  if (subject !== undefined) { fields.push('subject = ?'); values.push(subject) }
  if (body !== undefined) { fields.push('body = ?'); values.push(body) }
  if (fields.length > 0) {
    values.push(Number(id))
    db.prepare(`UPDATE templates SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  }

  if (setActive) {
    db.prepare("INSERT OR REPLACE INTO settings VALUES ('active_template_id', ?)").run(String(id))
  }

  return NextResponse.json({ ok: true })
}

export function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const db = getDb()

  const count = (db.prepare('SELECT COUNT(*) as c FROM templates').get() as { c: number }).c
  if (count <= 1) return NextResponse.json({ error: '마지막 템플릿은 삭제할 수 없습니다' }, { status: 400 })

  db.prepare('DELETE FROM templates WHERE id = ?').run(Number(id))

  const activeId = (db.prepare("SELECT value FROM settings WHERE key='active_template_id'").get() as { value: string } | undefined)?.value
  if (activeId === id) {
    const fallback = db.prepare('SELECT id FROM templates ORDER BY id LIMIT 1').get() as { id: number }
    db.prepare("INSERT OR REPLACE INTO settings VALUES ('active_template_id', ?)").run(String(fallback.id))
  }

  return NextResponse.json({ ok: true })
}
