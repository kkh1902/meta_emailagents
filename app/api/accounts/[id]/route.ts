import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    getDb().prepare('DELETE FROM accounts WHERE id=?').run(id)
    return NextResponse.json({ ok: true })
  })
}
