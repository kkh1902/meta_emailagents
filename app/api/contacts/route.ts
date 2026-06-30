import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import * as XLSX from 'xlsx'

export function GET(req: NextRequest) {
  const db = getDb()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''
  const perPage = 50

  let where = 'WHERE 1=1'
  const params: (string | number)[] = []
  if (status) { where += ' AND status=?'; params.push(status) }
  if (search) { where += ' AND (company_kr LIKE ? OR email LIKE ? OR ceo_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`) }

  const total = (db.prepare(`SELECT COUNT(*) as c FROM contacts ${where}`).get(...params) as { c: number }).c
  const contacts = db.prepare(`SELECT * FROM contacts ${where} ORDER BY id LIMIT ? OFFSET ?`).all(...params, perPage, (page - 1) * perPage)

  return NextResponse.json({ contacts, total, page, totalPages: Math.ceil(total / perPage) })
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''

  // 단일 연락처 추가 (JSON)
  if (contentType.includes('application/json')) {
    const { company_kr, ceo_name, email } = await req.json()
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
    const db = getDb()
    const existing = db.prepare('SELECT id FROM contacts WHERE email=?').get(email)
    if (existing) {
      db.prepare("UPDATE contacts SET company_kr=?, ceo_name=?, status='pending' WHERE email=?").run(company_kr, ceo_name, email)
      return NextResponse.json({ ok: true, action: 'updated' })
    }
    db.prepare('INSERT INTO contacts (company_kr, ceo_name, email, status) VALUES (?,?,?,?)').run(company_kr, ceo_name, email, 'pending')
    return NextResponse.json({ ok: true, action: 'inserted' })
  }

  // Excel 업로드 (multipart)
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const wsName = wb.SheetNames.includes('Exhibitors') ? 'Exhibitors' : wb.SheetNames[0]
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wsName]) as Record<string, string>[]

  const db = getDb()
  const insert = db.prepare(`INSERT OR IGNORE INTO contacts (company_kr,company_en,ceo_name,email,industry,booth_category,description) VALUES (?,?,?,?,?,?,?)`)

  let imported = 0, skipped = 0
  for (const row of rows) {
    const emailsRaw = row['Emails Found'] || ''
    const email = emailsRaw.split(';')[0].trim()
    if (!email || !email.includes('@')) { skipped++; continue }
    const existing = db.prepare('SELECT id FROM contacts WHERE email=?').get(email)
    if (existing) { skipped++; continue }
    insert.run(row['Company Name'] || '', row['Company Name EN'] || '', row['CEO'] || '',
      email, row['Industry Category'] || '', row['Booth Category'] || '', row['Description'] || '')
    imported++
  }

  return NextResponse.json({ imported, skipped })
}

export function DELETE() {
  getDb().prepare('DELETE FROM contacts').run()
  return NextResponse.json({ ok: true })
}
