import nodemailer from 'nodemailer'
import path from 'path'
import { getDb } from './db'

const INLINE_IMAGES = [
  { cid: 'ii_mqjfv69w0', path: path.join(process.cwd(), 'public', 'images', 'biz', 'bz_1.png') },
  { cid: 'ii_mqjfv6a81', path: path.join(process.cwd(), 'public', 'images', 'biz', 'bz_2.png') },
  { cid: 'ii_card_kangseungyoon', path: path.join(process.cwd(), 'public', 'images', 'biz', '대표님_명함.png') },
]

export function renderTemplate(template: string, contact: Record<string, string | null>): string {
  return template
    .replace(/{company}/g, contact.company_kr || contact.company_en || '')
    .replace(/{company_en}/g, contact.company_en || '')
    .replace(/{ceo}/g, contact.ceo_name || '담당자')
    .replace(/{industry}/g, contact.industry || '')
    .replace(/{description}/g, contact.description || '')
}

export async function sendToContact(contactId: number, accountEmail?: string): Promise<{ success: boolean; error?: string }> {
  const db = getDb()
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId) as Record<string, string | null>
  if (!contact) return { success: false, error: 'Contact not found' }

  const today = new Date().toISOString().split('T')[0]
  const account = accountEmail
    ? db.prepare('SELECT * FROM accounts WHERE email = ? AND active = 1').get(accountEmail) as Record<string, string | number> | undefined
    : db.prepare(`
        SELECT a.*, COUNT(l.id) as sent_today
        FROM accounts a
        LEFT JOIN send_logs l ON l.account_used = a.email
          AND date(l.sent_at) = ? AND l.status = 'success'
        WHERE a.active = 1
        GROUP BY a.id
        HAVING sent_today < a.daily_limit
        ORDER BY sent_today ASC
        LIMIT 1
      `).get(today) as Record<string, string | number> | undefined

  if (!account) return { success: false, error: '사용 가능한 계정 없음 (일일 한도 초과)' }

  const activeTemplateId = (db.prepare("SELECT value FROM settings WHERE key='active_template_id'").get() as { value: string } | undefined)?.value
  const template = db.prepare('SELECT subject, body FROM templates WHERE id = ?').get(Number(activeTemplateId)) as { subject: string; body: string }

  const subject = renderTemplate(template.subject, contact)
  const html = renderTemplate(template.body, contact)

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: account.email as string, pass: account.app_password as string },
    })

    await transporter.sendMail({
      from: account.email as string,
      to: contact.email as string,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, ''),
      headers: { 'List-Unsubscribe': `<mailto:${account.email}?subject=unsubscribe>` },
      attachments: INLINE_IMAGES.map(img => ({
        filename: path.basename(img.path),
        path: img.path,
        cid: img.cid,
        contentDisposition: 'inline' as const,
      })),
    })

    db.prepare(`INSERT INTO send_logs (contact_id, email, company, account_used, mail_type, status, subject) VALUES (?,?,?,?,?,?,?)`)
      .run(contactId, contact.email, contact.company_kr, account.email, 'initial', 'success', subject)
    db.prepare(`UPDATE contacts SET status='sent', sent_at=datetime('now','localtime'), account_used=? WHERE id=?`)
      .run(account.email, contactId)

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    db.prepare(`INSERT INTO send_logs (contact_id, email, company, account_used, mail_type, status, error_msg, subject) VALUES (?,?,?,?,?,?,?,?)`)
      .run(contactId, contact.email, contact.company_kr, account.email, 'initial', 'failed', msg, subject)
    return { success: false, error: msg }
  }
}
