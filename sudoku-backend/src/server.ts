import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import recordRoutes from './routes/records'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
)
app.use(express.json())

app.use('/api/records', recordRoutes)

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/sudoku')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
