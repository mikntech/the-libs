import { createRequire } from 'module';
import { WatchDB } from './watch';
import {
  Connection,
  IndexDefinition,
  IndexOptions,
  Model,
  Schema,
  SchemaDefinition,
  Document,
  Types,
  Query,
  QueryWithHelpers,
} from 'mongoose';
import { versioning } from './autoVersioning';
import { TODO } from '@the-libs/base-shared';
import { mongoSettings } from '../../config';
import { recursivelySignUrls } from '@the-libs/s3-backend';
import { getCached, SchemaComputers } from './computedFields';

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const connection: { instance?: Connection } = {};

const connect = async (
  logMongoToConsole: boolean = mongoSettings.defaultDebugAllModels,
) => {
  mongoose.set('debug', logMongoToConsole ?? true);
  try {
    await mongoose.connect(mongoSettings.mongoURI);
    console.log('Mongo DB connected successfully');
    connection.instance = mongoose.connection;
    WatchDB.start();
  } catch (err) {
    console.log('mongo connection error:' + err);
    throw new Error(String(err));
  }
};

const initModel = <DBPart extends Document>(
  connection: {
    instance?: Connection;
  },
  name: string,
  schema: Schema,
) => {
  if (!connection.instance) throw new Error('Database not initialized');
  return connection.instance.model<DBPart>(
    name,
    schema.plugin(versioning, { collection: name + 's.history', mongoose }),
  );
};

interface Optional<DBPart, ComputedPart> {
  chainToSchema?: { name: TODO; params: TODO[] }[];
  wrapSchema?: Function[];
  extraIndexes?: { fields: IndexDefinition; options?: IndexOptions }[];
  pres?: ((schema: Schema) => (model: Model<DBPart>) => Schema)[];
  logMongoToConsole?: boolean;
  computedFields?: SchemaComputers<ComputedPart>;
}

type GetCached<ComputedPart> = (_id: Types.ObjectId) => Promise<ComputedPart>;

export class ExtendedModel<DocI extends Document, ComputedPart = any> {
  public readonly model: Model<DocI>;
  public readonly getCached: ComputedPart extends undefined
    ? undefined
    : GetCached<ComputedPart>;

  constructor({
    model,
    getCached,
  }: {
    model: Model<DocI>;
    getCached: ComputedPart extends undefined
      ? undefined
      : GetCached<ComputedPart>;
  }) {
    this.model = model;
    this.getCached = getCached;
  }

  // Explicitly handle query-returning methods
  findOne(
    ...args: Parameters<Model<DocI>['findOne']>
  ): Query<DocI | null, DocI> {
    return this.model.findOne(...args);
  }

  find(
    filter: any,
    projection?: any | null | undefined,
    options?: any | null | undefined,
  ) {
    return this.model.find(filter, projection, options);
  }

  // Add other query-returning methods explicitly if needed
  findById(
    ...args: Parameters<Model<DocI>['findById']>
  ): Query<DocI | null, DocI> {
    return this.model.findById(...args);
  }

  limit(
    ...args: Parameters<QueryWithHelpers<any, DocI>['limit']>
  ): Query<DocI[], DocI> {
    return this.model.find().limit(...args);
  }

  // TODO Add more model methods as needed
}

export const getModel = async <DBPart extends Document, ComputedPart = never>(
  name: string,
  schemaDefinition: SchemaDefinition,
  {
    chainToSchema,
    wrapSchema,
    extraIndexes,
    pres,
    logMongoToConsole,
    computedFields,
  }: Optional<DBPart, ComputedPart> = {},
) => {
  if (!connection?.instance) await connect(logMongoToConsole);
  let model: Model<DBPart>;
  let schema = new mongoose.Schema(schemaDefinition, {
    timestamps: true,
  });
  wrapSchema?.forEach((wrapper) => {
    schema = wrapper(schema);
  });
  type CHAINABLE = unknown;
  chainToSchema?.forEach(({ name, params }) =>
    (schema as CHAINABLE as TODO)[name](...params),
  );
  extraIndexes?.forEach((extraIndex) =>
    schema.index(extraIndex.fields, extraIndex.options),
  );

  const funcs = pres?.map((fnc) => fnc(schema));

  if (mongoose.models[name]) {
    model = connection!.instance!.model<DBPart>(name);
  } else {
    model = initModel<DBPart>(connection, name, schema);
  }

  funcs?.map((fnc) => {
    model = initModel<DBPart>(connection, name, fnc(model));
  });

  const getCachedParent: {
    getCached: ComputedPart extends undefined
      ? undefined
      : GetCached<ComputedPart>;
  } = {} as TODO;
  if (computedFields)
    getCachedParent.getCached = (async (_id: Types.ObjectId) =>
      getCached(_id, computedFields)) as TODO;

  // markModelAsWatched(name); // Mark the model as watched

  return new ExtendedModel<DBPart, ComputedPart>({
    model,
    ...getCachedParent,
  });
};

export const autoSignS3URIs = (schema: Schema) => {
  const signS3UrlsMiddleware = async function (docs: Document | Document[]) {
    if (Array.isArray(docs)) {
      await Promise.all(
        docs.map(async (doc) => {
          await recursivelySignUrls(doc);
        }),
      );
    } else if (docs) {
      await recursivelySignUrls(docs);
    }
  };

  return schema.post(/find/, signS3UrlsMiddleware);
};
