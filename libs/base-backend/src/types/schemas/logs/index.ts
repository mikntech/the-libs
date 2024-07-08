import { Document } from '../';

export interface ErrorLog extends Document {
  stringifiedError: string;
}
