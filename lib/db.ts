import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), '..', 'email_agent.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    initDb(_db)
  }
  return _db
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      app_password TEXT NOT NULL,
      daily_limit INTEGER DEFAULT 14,
      active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_kr TEXT, company_en TEXT, ceo_name TEXT,
      email TEXT NOT NULL, industry TEXT, booth_category TEXT, description TEXT,
      status TEXT DEFAULT 'pending',
      sent_at TEXT, account_used TEXT,
      followup_d3_sent INTEGER DEFAULT 0,
      followup_d7_sent INTEGER DEFAULT 0,
      bounced INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS send_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER, email TEXT, company TEXT,
      account_used TEXT, mail_type TEXT DEFAULT 'initial',
      status TEXT, error_msg TEXT, subject TEXT,
      sent_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY, value TEXT
    );
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT,
      body TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `)
  // 마이그레이션: subject 컬럼 추가
  try { db.exec('ALTER TABLE send_logs ADD COLUMN subject TEXT') } catch {}

  const insert = db.prepare("INSERT OR IGNORE INTO settings VALUES (?, ?)")
  insert.run('schedule_active', '0')
  insert.run('daily_limit', '40')
  insert.run('batch_times', '09:00,11:00,13:00,15:00')
  insert.run('email_subject', '[NextRise] {company} 파트너십 제안드립니다')
  insert.run('email_body', DEFAULT_TEMPLATE)

  // 마이그레이션: 기존 단일 템플릿(email_subject/email_body)을 templates 테이블 "템플릿 1"로 이전
  const templateCount = (db.prepare('SELECT COUNT(*) as c FROM templates').get() as { c: number }).c
  if (templateCount === 0) {
    const subject = (db.prepare("SELECT value FROM settings WHERE key='email_subject'").get() as { value: string }).value
    const body = (db.prepare("SELECT value FROM settings WHERE key='email_body'").get() as { value: string }).value
    const info = db.prepare('INSERT INTO templates (name, subject, body) VALUES (?, ?, ?)').run('템플릿 1', subject, body)
    insert.run('active_template_id', String(info.lastInsertRowid))
  }
}

const DEFAULT_TEMPLATE = `<div style="font-family:Arial,sans-serif;max-width:600px;color:#333;line-height:1.6">
<p>안녕하세요, <strong>{ceo}</strong> 대표님</p>
<p><strong>{company}</strong>의 혁신적인 사업에 관심을 갖게 되어 연락드립니다.</p>
<p>저희는 [귀사 소개 한 줄]이며, {industry} 분야에서 함께 시너지를 낼 수 있는 기회가 있다고 생각합니다.</p>
<p>5분 정도 시간을 내주신다면 간략하게 소개드리고 싶습니다.<br>편하신 시간에 미팅을 요청드려도 될까요?</p>
<p>감사합니다.<br><strong>[발신자 이름]</strong><br>[회사명] | [연락처]</p>
<hr style="border:none;border-top:1px solid #eee;margin:24px 0">
<p style="font-size:11px;color:#999">본 메일은 비즈니스 제안 목적으로 발송되었습니다. 수신을 원하지 않으시면 회신으로 알려주세요.</p>
</div>`
