import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> => {
      try {
        return await mongoose.connect(process.env.DATABASE_URI as string);
      } catch (error) {
        console.error('Database connection error:', error);
        throw error;
      }
    },
  },
];
