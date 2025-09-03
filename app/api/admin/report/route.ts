import { NextRequest, NextResponse } from 'next/server'
import { routeHandlerClient } from '@/lib/supabaseServer'

function isAdmin(email?: string | null) {
  const allow = process.env.ADMIN_EMAIL_ALLOWLIST?.split(',').map((s) => s.trim().toLowerCase()) ?? []
  return email ? allow.includes(email.toLowerCase()) : false
}

export async function POST(req: NextRequest) {
  const supabase = routeHandlerClient()
  const form = await req.formData()
  const id = Number(form.get('id'))
  const status = String(form.get('status'))

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('reports').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.redirect(new URL('/admin/moderation', req.url))
}

