import { Param } from '@nestjs/common';
import { ParseMongoIdPipe } from '../pipes/parse-mongo-id.pipe';

export const MongoIdParam = (name: string = 'id') =>
  Param(name, ParseMongoIdPipe);
