import 'dotenv/config'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

initializeApp({
  credential: cert('./firebase-service-account.json')
})

const db = getFirestore()

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// Load the email -> supabase_user_id mapping from Phase 2's output
const csv = fs.readFileSync('./migration-output/user-mapping.csv', 'utf-8')
const lines = csv.trim().split('\n').slice(1) // skip header
const emailToSupabaseId = new Map()
for (const line of lines) {
  const [firebase_uid, email, supabase_user_id] = line.split(',')
  if (supabase_user_id && supabase_user_id !== 'FAILED') {
    emailToSupabaseId.set(email.toLowerCase(), supabase_user_id)
  }
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
  try {
    const { buffer, mimeType, ext } = base64ToBuffer(base64String)
    const path = `${userId}/${label}.${ext}`
    const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
      contentType: mimeType,
      upsert: true
    })
    if (error) {
      console.error(`  Upload failed (${bucket}/${path}): ${error.message}`)
      return null
    }
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  } catch (err) {
    console.error(`  Image decode/upload error: ${err.message}`)
    return null
  }
}

async function migrateCards() {
  const snapshot = await db.collection('businessCards').get()
  const results = []

  for (const doc of snapshot.docs) {
    const data = doc.data()
    const email = (data.email || '').toLowerCase()
    const supabaseUserId = emailToSupabaseId.get(email)

    if (!supabaseUserId) {
      console.error(`SKIPPED — no Supabase user found for email: ${data.email} (doc ${doc.id})`)
      results.push({ doc_id: doc.id, status: 'SKIPPED_NO_USER', email: data.email })
      continue
    }

    console.log(`Migrating: ${data.fullName} (${email})`)

    const photoUrl = await uploadImage('avatars', supabaseUserId, data.photoUrl, 'photo')
    const backgroundUrl = await uploadImage('backgrounds', supabaseUserId, data.backgroundUrl, 'background')

    const { error } = await supabaseAdmin.from('business_cards').insert({
      user_id: supabaseUserId,
      full_name: data.fullName || null,
      nickname: data.nickname || null,
      job_title: data.jobTitle || null,
      department: data.department || null,
      company: data.company || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      address: data.address || null,
      bio: data.bio || null,
      photo_url: photoUrl,
      background_url: backgroundUrl,
      line_id: data.lineId || null,
      line_url: data.lineUrl || null,
      wechat_id: data.wechatId || null,
      whatsapp_number: data.whatsappNumber || null,
      facebook_url: data.facebookUrl || null,
      instagram_url: data.instagramUrl || null,
      linkedin_url: data.linkedinUrl || null,
      tiktok_url: data.tiktokUrl || null,
      youtube_url: data.youtubeUrl || null,
      google_maps_url: data.googleMapsUrl || null
    })

    if (error) {
      console.error(`  INSERT FAILED: ${error.message}`)
      results.push({ doc_id: doc.id, status: 'INSERT_FAILED', email: data.email, error: error.message })
    } else {
      console.log(`  OK`)
      results.push({ doc_id: doc.id, status: 'OK', email: data.email })
    }
  }

  const okCount = results.filter(r => r.status === 'OK').length
  const skipCount = results.filter(r => r.status !== 'OK').length
  console.log(`\nDone. ${okCount} migrated, ${skipCount} skipped/failed.`)
  fs.writeFileSync('./migration-output/card-migration-log.json', JSON.stringify(results, null, 2))
}

migrateCards().catch(console.error)
