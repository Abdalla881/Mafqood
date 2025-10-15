import { Connection } from 'mongoose';
import { itemSchema } from './schema/item.schema ';

export const itemsProviders = [
  {
    provide: 'ITEM_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('item', itemSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
