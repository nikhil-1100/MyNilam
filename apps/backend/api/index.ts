import { createApp } from '../src/app'
import { connectDatabase } from '../src/config/database'
import { connectRedis } from '../src/config/redis'

let isInitialized = false

const app = createApp()

// Ensure DB and Redis are connected on first invocation in the serverless environment
app.use(async (req, res, next) => {
  if (!isInitialized) {
    try {
      await Promise.all([
        connectDatabase(),
        connectRedis()
      ])
      isInitialized = true
    } catch (err) {
      console.error('Serverless backend initialization failed:', err)
    }
  }
  next()
})

export default app
