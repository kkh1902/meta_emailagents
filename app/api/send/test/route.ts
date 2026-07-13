import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import nodemailer from 'nodemailer'
import path from 'path'

const INLINE_IMAGES = [
  { cid: 'ii_mqjfv69w0', path: path.join(process.cwd(), 'public', 'sig_ii_mqjfv69w0.jpg') },
  { cid: 'ii_mqjfv6a81', path: path.join(process.cwd(), 'public', 'sig_ii_mqjfv6a81.jpg') },
]

export async function POST(req: NextRequest) {
  const { name, email, fromAccount } = await req.json()
  const db = getDb()

  // 테스트는 항상 맨 위 계정(id 최소값) 사용
  const account = (fromAccount
    ? db.prepare('SELECT * FROM accounts WHERE email=? AND active=1').get(fromAccount)
    : db.prepare('SELECT * FROM accounts WHERE active=1 ORDER BY id ASC LIMIT 1').get()
  ) as Record<string, string> | undefined
  if (!account) return NextResponse.json({ success: false, error: '등록된 발송 계정이 없습니다' })

  const settings = Object.fromEntries(
    (db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]).map(r => [r.key, r.value])
  )

  const subject = settings.email_subject?.replace('{company}', '테스트회사') || '테스트 메일'
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
      attachments: INLINE_IMAGES.map(img => ({
        filename: img.cid + '.jpg',
        path: img.path,
        cid: img.cid,
        contentDisposition: 'inline' as const,
      })),
    })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) })
  }
}
