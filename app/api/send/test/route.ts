import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const { name, email } = await req.json()
  const db = getDb()

  const account = db.prepare('SELECT * FROM accounts WHERE active=1 LIMIT 1').get() as Record<string, string> | undefined
  if (!account) return NextResponse.json({ success: false, error: '등록된 발송 계정이 없습니다' })

  const settings = Object.fromEntries(
    (db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]).map(r => [r.key, r.value])
  )

  const subject = `[테스트] ${settings.email_subject?.replace('{company}', '테스트회사') || '테스트 메일'}`
  const html = (settings.email_body || '<p>테스트 메일입니다.</p>')
    .replace(/{ceo}/g, name || '담당자')
    .replace(/{company}/g, '테스트회사')
    .replace(/{company_en}/g, 'Test Company')
    .replace(/{industry}/g, 'IT')
    .replace(/{description}/g, '테스트 발송입니다.')

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 587, secure: false,
      auth: { user: account.email, pass: account.app_password },
    })
    await transporter.sendMail({
      from: account.email, to: email,
      subject, html,
      text: html.replace(/<[^>]+>/g, ''),
    })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) })
  }
}
