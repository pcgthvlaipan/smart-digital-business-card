import 'dotenv/config'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

initializeApp({
  credential: cert('./firebase-service-account.json')
})

const db = getFirestore()
const auth = getAuth()

async function checkOrphaned() {
  const snapshot = await db.collection('businessCards').get()
  const cardUserIds = new Set()
  snapshot.forEach(doc => cardUserIds.add(doc.data().userId))

  const authUserIds = new Set()
  let nextPageToken
  do {
    const result = await auth.listUsers(1000, nextPageToken)
    result.users.forEach(u => authUserIds.add(u.uid))
    nextPageToken = result.pageToken
  } while (nextPageToken)

  console.log(`Card userIds: ${cardUserIds.size}, Auth userIds: ${authUserIds.size}`)

  for (const uid of cardUserIds) {
    if (!authUserIds.has(uid)) {
      console.log(`ORPHANED CARD — userId ${uid} has no matching Firebase Auth account`)
    }
  }
}

checkOrphaned().catch(console.error)
