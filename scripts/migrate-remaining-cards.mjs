import 'dotenv/config'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

initializeApp({ credential: cert('./firebase-service-account.json') })
const db = getFirestore()
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

const csv = fs.readFileSync('./migration-output/user-mapping.csv', 'utf-8')
const emailToSupabaseId = new Map()
for (const line of csv.trim().split('\n').slice(1)) {
  const [, email, supabase_user_id] = line.split(',')
  if (supabase_user_id && supabase_user_id !== 'FAILED') emailToSupabaseId.set(email.toLowerCase(), supabase_user_id)
}

const emailOverrides = {
  'UxcGh6Iw3gQ9kKyyoKWxzpzhPy32': 'punyathon.wan@perfectcompanion.com',
  'YXuSU3jBWaVnqR9g8h6ap67bE1y2': 'rattana.kun@perfectcompanion.com'
}

function base64ToBuffer(base64String) {
  const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
  const mimeType = matches ? matches[1] : 'image/jpeg'
  const base64Data = matches ? matches[2] : base64String
  const ext = mimeType.split('/')[1] || 'jpg'
  return { buffer: Buffer.from(base64Data, 'base64'), mimeType, ext }
}

async function uploadImage(bucket, userId, base64String, label) {
  if (!base64String) return null
  const { buffer, mimeType, ext } = base64ToBuffer(base64String)
  const path = `${userId}/${label}.${ext}`
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, { contentType: mimeType, upsert: true })
  if (error) { console.error(`  Upload failed: ${error.message}`); return null }
  return supabaseAdmin.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

async function run() {
  for (const [docId, correctEmail] of Object.entries(emailOverrides)) {
    const doc = await db.collection('businessCards').doc(docId).get()
    if (!doc.exists) { console.error(`Doc ${docId} not found`); continue }
    const data = doc.data()
    const supabaseUserId = emailToSupabaseId.get(correctEmail.toLowerCase())
    if (!supabaseUserId) { console.error(`Still no match for ${correctEmail}`); continue }

    console.log(`Migrating (corrected): ${data.fullName} -> ${correctEmail}`)
    const photoUrl = await uploadImage('avatars', supabaseUserId, data.photoUrl, 'photo')
    const backgroundUrl = await uploadImage('backgrounds', supabaseUserId, data.backgroundUrl, 'background')

    const { error } = await supabaseAdmin.from('business_cards').insert({
      user_id: supabaseUserId, full_name: data.fullName || null, nickname: data.nickname || null,
      job_title: data.jobTitle || null, department: data.department || null, company: data.company || null,
      phone: data.phone || null, email: correctEmail, website: data.website || null, address: data.address || null,
      bio: data.bio || null, photo_url: photoUrl, background_url: backgroundUrl, line_id: data.lineId || null,
      line_url: data.lineUrl || null, wechat_id: data.wechatId || null, whatsapp_number: data.whatsappNumber || null,
      facebook_url: data.facebookUrl || null, instagram_url: data.instagramUrl || null, linkedin_url: data.linkedinUrl || null,
      tiktok_url: data.tiktokUrl || null, youtube_url: data.youtubeUrl || null, google_maps_url: data.googleMapsUrl || null
    })

    if (error) console.error(`  INSERT FAILED: ${error.message}`)
    else console.log(`  OK`)
  }
}

run().catch(console.error)
