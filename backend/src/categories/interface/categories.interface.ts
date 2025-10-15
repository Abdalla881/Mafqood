import { Document } from 'mongoose';
export interface category extends Document {
  readonly name: string;
  readonly image: {
    public_id: string;
    url: string;
  };
}
