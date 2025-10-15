import * as mongoose from 'mongoose';

export const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  },
  { timestamps: true },
);
