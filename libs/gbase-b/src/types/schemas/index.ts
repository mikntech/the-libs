import { Document as MDocument, ObjectId } from 'mongoose';

export interface Document extends MDocument {
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
