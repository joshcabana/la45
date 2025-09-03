import { serverComponentClient } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

function isAdmin(email?: string | null) {
  const allow = process.env.ADMIN_EMAIL_ALLOWLIST?.split(',').map((s) => s.trim().toLowerCase()) ?? []
  return email ? allow.includes(email.toLowerCase()) : false
}

type Report = { id: number; reporter: string; reported: string; reason: string; status?: string; created_at: string }

export default async function ModerationPage() {
  const supabase = serverComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) {
    return <div className="p-8">Not authorised.</div>
  }

  const { data: reports } = await supabase
    .from('reports')
    .select('id, reporter, reported, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl">Moderation</h1>
      <div className="mt-6 overflow-x-auto ring-1 ring-white/10 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Reporter</th>
              <th className="px-3 py-2 text-left">Reported</th>
              <th className="px-3 py-2 text-left">Reason</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports?.map((r: Report) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{r.reporter}</td>
                <td className="px-3 py-2">{r.reported}</td>
                <td className="px-3 py-2">{r.reason}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">
                  <form action="/api/admin/report" method="post" className="flex gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <button name="status" value="actioned" className="px-3 py-1 rounded bg-white text-black text-xs">
                      Actioned
                    </button>
                    <button name="status" value="ignored" className="px-3 py-1 rounded border border-white/30 text-xs">
                      Ignore
                    </button>
                    <button name="status" value="open" className="px-3 py-1 rounded border border-white/30 text-xs">
                      Reopen
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!reports?.length && (
              <tr>
                <td className="px-3 py-6 text-white/70" colSpan={6}>
                  No reports.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
