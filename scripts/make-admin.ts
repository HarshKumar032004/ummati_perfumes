import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local')
  process.exit(1)
}

const phoneArg = process.argv[2]

if (!phoneArg) {
  console.error('❌ Please provide a phone number. Usage: npx tsx scripts/make-admin.ts <phone_number>')
  process.exit(1)
}

async function makeAdmin() {
  try {
    await mongoose.connect(MONGODB_URI!)
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db
    if (!db) throw new Error('Database not initialized')

    const usersCollection = db.collection('users')
    
    // Find the user and update
    const result = await usersCollection.updateOne(
      { phone: phoneArg },
      { $set: { role: 'admin' } }
    )

    if (result.matchedCount === 0) {
      console.log(`⚠️ No user found with phone number: ${phoneArg}. Please log in on the website first to create the account.`)
    } else if (result.modifiedCount === 0) {
      console.log(`ℹ️ User ${phoneArg} is already an admin.`)
    } else {
      console.log(`🎉 Success! User ${phoneArg} has been granted Admin privileges.`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

makeAdmin()
