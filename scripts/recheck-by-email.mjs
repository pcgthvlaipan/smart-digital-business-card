import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function recheck() {
  const { data, error } = await supabaseAdmin
    .from('business_cards')
    .select('id, user_id, full_name, email, job_title, created_at')
    .order('email')

  if (error) { console.error(error); return }

  console.log(`Total rows: ${data.length}`)

  const byEmail = {}
  for (const row of data) {
    const key = (row.email || 'NO_EMAIL').toLowerCase()
    byEmail[key] = byEmail[key] || []
    byEmail[key].push(row)
  }

  console.log(`Unique emails: ${Object.keys(byEmail).length}`)

  for (const [email, rows] of Object.entries(byEmail)) {
    if (rows.length > 1) {
      console.log(`\n=== ${email} (${rows.length} cards) ===`)
      rows.forEach(r => console.log(`  id: ${r.id} | user_id: ${r.user_id} | name: ${r.full_name} | title: ${r.job_title} | created: ${r.created_at}`))
    }
  }
}

recheck().catch(console.error)
