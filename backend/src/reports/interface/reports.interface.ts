import { Document, Types } from 'mongoose';

export interface Report extends Document {
  readonly title: string;
  readonly typr: 'lost' | 'found';
  readonly location: string;
  readonly date: Date;
  readonly contactInfo: string;
  readonly reward?: string;
  readonly reporter: Types.ObjectId;
  readonly item: Types.ObjectId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
