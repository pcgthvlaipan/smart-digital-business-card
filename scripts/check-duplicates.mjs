import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function checkDuplicates() {
  const { data, error } = await supabaseAdmin
    .from('business_cards')
    .select('id, user_id, full_name, email, job_title, department, created_at')
    .order('user_id')

  if (error) { console.error(error); return }

  const byUser = {}
  for (const row of data) {
    byUser[row.user_id] = byUser[row.user_id] || []
    byUser[row.user_id].push(row)
  }

  for (const [userId, rows] of Object.entries(byUser)) {
    if (rows.length > 1) {
      console.log(`\n=== ${rows[0].email} (${rows.length} cards) ===`)
      rows.forEach(r => console.log(`  id: ${r.id} | name: ${r.full_name} | title: ${r.job_title} | dept: ${r.department} | created: ${r.created_at}`))
    }
  }
}

checkDuplicates().catch(console.error)
