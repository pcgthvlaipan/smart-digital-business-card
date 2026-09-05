import 'dotenv/config'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function findMissing() {
  const csv = fs.readFileSync('./migration-output/user-mapping.csv', 'utf-8')
  const allEmails = csv.trim().split('\n').slice(1)
    .map(line => line.split(',')[1])
    .filter(Boolean)

  const { data, error } = await supabaseAdmin.from('business_cards').select('email')
  if (error) { console.error(error); return }

  const cardEmails = new Set(data.map(r => (r.email || '').toLowerCase()))

  console.log('Users with no card in business_cards:')
  for (const email of allEmails) {
    if (!cardEmails.has(email.toLowerCase())) {
      console.log(`  ${email}`)
    }
  }
}

findMissing().catch(console.error)
