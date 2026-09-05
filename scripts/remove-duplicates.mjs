import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

const idsToDelete = [
  'bae323b5-9246-43f4-80e4-16b1e3cbee02',
  '2bc4e632-82bc-4609-9a32-86a474dc8764',
  'caed9e71-f5cb-4c8f-bbb8-65fb28bda98d',
  '659d9ebd-4e25-43b3-b7c2-55a36a42305d',
  'ff17bac5-2008-4fbf-a6f5-d81093383ef3',
  'fbbb5bf4-662f-4362-a82c-d246553fb8d2'
]

async function removeDuplicates() {
  for (const id of idsToDelete) {
    const { error } = await supabaseAdmin.from('business_cards').delete().eq('id', id)
    if (error) console.error(`FAILED to delete ${id}: ${error.message}`)
    else console.log(`Deleted: ${id}`)
  }

  const { count, error: countError } = await supabaseAdmin
    .from('business_cards')
    .select('*', { count: 'exact', head: true })

  if (countError) console.error(countError)
  else console.log(`\nTotal remaining rows: ${count}`)
}

removeDuplicates().catch(console.error)
