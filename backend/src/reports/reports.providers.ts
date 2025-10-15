import { Connection } from 'mongoose';
import { reportSchema } from './schema/report.schema';
import { itemSchema } from '../items/schema/item.schema ';

export const reportsProviders = [
  {
    provide: 'REPORT_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('report', reportSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
