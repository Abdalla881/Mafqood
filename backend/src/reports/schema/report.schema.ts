export class Report {}
import * as mongoose from 'mongoose';

export const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['lost', 'found'], required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    contactInfo: { type: String, required: true },
    reward: { type: String },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'item', required: true },
  },
  { timestamps: true },
);
