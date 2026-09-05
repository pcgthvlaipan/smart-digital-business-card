import 'dotenv/config'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp({
  credential: cert('./firebase-service-account.json')
})

const db = getFirestore()

async function inspect() {
  const snapshot = await db.collection('businessCards')
    .where('userId', '==', 'xRcYGFZNlKVqoVxDqAiaRa4Z5eq1')
    .get()

  snapshot.forEach(doc => {
    const data = doc.data()
    console.log('Doc ID:', doc.id)
    console.log('fullName:', data.fullName)
    console.log('email:', data.email)
    console.log('jobTitle:', data.jobTitle)
    console.log('company:', data.company)
    console.log('createdAt:', data.createdAt?.toDate?.())
    console.log('updatedAt:', data.updatedAt?.toDate?.())
  })
}

inspect().catch(console.error)
