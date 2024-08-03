import { Document } from '../index';

export interface ErrorLog extends Document {
  stringifiedError: string;
}
