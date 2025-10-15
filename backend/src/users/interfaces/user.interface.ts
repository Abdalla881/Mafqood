import { Document } from 'mongoose';

export interface user extends Document {
  readonly name: string;
  readonly age: number;
  readonly email: string;
  readonly phone?: string;
  readonly role: string;
  password: string;
  resetCode?: string;
  resetCodeExpires?: Date;
  resetCodeVerified?: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  passwordChangedAt?: Date;
  avatar: {
    public_id: string;
    url: string;
  };

  comparePassword(candidatePassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
}
