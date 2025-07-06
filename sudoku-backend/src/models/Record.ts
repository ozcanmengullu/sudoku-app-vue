import mongoose, { Schema, Document } from 'mongoose'

export interface IRecord extends Document {
  name: string
  score: number
  time: number
  difficulty: 'beginner' | 'intermediate' | 'hard' | 'expert'
  date: Date
}

const RecordSchema: Schema = new Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  time: { type: Number, required: true },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'hard', 'expert'],
    required: true,
  },
  date: { type: Date, default: Date.now },
})

export default mongoose.model<IRecord>('Record', RecordSchema)
