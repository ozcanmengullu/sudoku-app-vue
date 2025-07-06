import express from 'express'
import Record from '../models/Record'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const difficulties = ['beginner', 'intermediate', 'hard', 'expert']
    const records: Record<string, unknown[]> = {}

    for (const difficulty of difficulties) {
      records[difficulty] = await Record.find({ difficulty }).sort({ score: -1 }).limit(3).exec()
    }

    res.json(records)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch records' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, score, time, difficulty } = req.body

    const newRecord = new Record({
      name,
      score,
      time,
      difficulty,
    })

    await newRecord.save()

    const topRecords = await Record.find({ difficulty }).sort({ score: -1 }).limit(3).exec()

    res.json(topRecords)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to save record' })
  }
})

export default router
