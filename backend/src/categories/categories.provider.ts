import { Connection } from 'mongoose';
import { CategorySchema } from './schema/category.schema';

export const CategoryProviders = [
  {
    provide: 'CATEGORY_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('category', CategorySchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
