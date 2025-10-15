import { Document } from 'mongoose';

export interface Item extends Document {
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly brand?: string;
  readonly color?: string;
  readonly uniqueMarks?: string;
  readonly images?: {
    public_id: string;
    url: string;
  }[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
