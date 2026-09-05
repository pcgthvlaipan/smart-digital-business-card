import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function verify() {
  const { data, error } = await supabaseAdmin
    .from('business_cards')
    .select('*')
    .eq('id', '439006ab-6469-4eb6-b8eb-070e21920bd3')
    .single()

  if (error) { console.error('Error:', error.message); return }
  console.log('Card found!')
  console.log('full_name:', data.full_name)
  console.log('email:', data.email)
  console.log('photo_url:', data.photo_url)
  console.log('user_id:', data.user_id)
}

verify().catch(console.error)
