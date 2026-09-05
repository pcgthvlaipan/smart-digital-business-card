import 'dotenv/config'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp({
  credential: cert('./firebase-service-account.json')
})

const db = getFirestore()

async function countCards() {
  const snapshot = await db.collection('businessCards').get()
  console.log(`Total documents: ${snapshot.size}`)

  const userIds = new Set()
  let missingUserId = 0
  snapshot.forEach(doc => {
    const data = doc.data()
    if (data.userId) {
      userIds.add(data.userId)
    } else {
      missingUserId++
    }
  })

  console.log(`Unique userIds referenced: ${userIds.size}`)
  console.log(`Documents missing userId: ${missingUserId}`)
}

countCards().catch(console.error)
