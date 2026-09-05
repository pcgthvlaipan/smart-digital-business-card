import 'dotenv/config'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import crypto from 'crypto'

initializeApp({
  credential: cert('./firebase-service-account.json')
})

const firebaseAuth = getAuth()

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

function generateTempPassword() {
  return crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 10)
}

async function migrateUsers() {
  const rows = []
  let nextPageToken

  do {
    const result = await firebaseAuth.listUsers(1000, nextPageToken)
    for (const fbUser of result.users) {
      const tempPassword = generateTempPassword()

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: fbUser.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { firebase_uid: fbUser.uid, display_name: fbUser.displayName || '' }
      })

      if (error) {
        console.error(`FAILED: ${fbUser.email} — ${error.message}`)
        rows.push({ firebase_uid: fbUser.uid, email: fbUser.email, supabase_user_id: 'FAILED', temp_password: '', error: error.message })
        continue
      }

      console.log(`OK: ${fbUser.email} -> ${data.user.id}`)
      rows.push({ firebase_uid: fbUser.uid, email: fbUser.email, supabase_user_id: data.user.id, temp_password: tempPassword, error: '' })
    }
    nextPageToken = result.pageToken
  } while (nextPageToken)

  const csv = [
    'firebase_uid,email,supabase_user_id,temp_password,error',
    ...rows.map(r => `${r.firebase_uid},${r.email},${r.supabase_user_id},${r.temp_password},${r.error}`)
  ].join('\n')

  fs.writeFileSync('./migration-output/user-mapping.csv', csv)
  console.log(`\nDone. ${rows.length} users processed. See migration-output/user-mapping.csv`)
}

migrateUsers().catch(console.error)
