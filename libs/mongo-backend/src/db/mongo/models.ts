import { createRequire } from 'module';
import { WatchDB } from './watch';
import {
  Connection,
  Document,
  IndexDefinition,
  IndexOptions,
  Model,
  Query,
  QueryWithHelpers,
  Schema,
  SchemaDefinition,
} from 'mongoose';
import { versioning } from './autoVersioning';
import { StagingEnvironment, TODO } from '@the-libs/base-shared';
import { mongoSettings } from '../../config';
import { recursivelySignUrls } from '@the-libs/s3-backend';
import {
  getCached,
  refreshCacheIfNeeded,
  SchemaComputers,
} from './computedFields';
import { ChangeStreamDocument, ChangeStreamUpdateDocument } from 'mongodb';
import {
  createRedisInstance,
  PubSub,
  runTaskWithLock,
} from '@the-libs/redis-backend';
import { DBDoc } from '../../utils';

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const connection: { instance?: Connection } = {};

const pub = await createRedisInstance('pub');
const sub = await createRedisInstance('sub');

export const mongoPubSubInstance = new PubSub(pub, sub);

interface Reg {
  model: Model<any>;
  computedFields: SchemaComputers<any, any, any>;
}
const allComputedFields: Reg[] = [];

const registerComputedFields = (r: Reg) => allComputedFields.push(r);

const connect = async (
  logMongoToConsole: boolean = mongoSettings.defaultDebugAllModels,
) => {
  mongoose.set('debug', logMongoToConsole ?? true);
  try {
    await mongoose.connect(mongoSettings.mongoURI, {
      socketTimeoutMS:
        mongoSettings.stagingEnv === StagingEnvironment.Local ? 30000 : 45000,
      maxPoolSize:
        mongoSettings.stagingEnv === StagingEnvironment.Local ? 10 : 100,
      minPoolSize:
        mongoSettings.stagingEnv === StagingEnvironment.Local ? 1 : 5,
      serverSelectionTimeoutMS:
        mongoSettings.stagingEnv === StagingEnvironment.Local ? 5000 : 10000,
      connectTimeoutMS:
        mongoSettings.stagingEnv === StagingEnvironment.Local ? 5000 : 10000,
    });
    console.log('Mongo DB connected successfully');
    connection.instance = mongoose.connection;
    WatchDB.start();
  } catch (err) {
    console.log('mongo connection error:' + err);
    throw new Error(String(err));
  }
};

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed on app termination');
  process.exit(0);
});

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

export interface Optional<DBPart extends Document, ComputedPart> {
  chainToSchema?: { name: TODO; params: TODO[] }[];
  wrapSchema?: Function[];
  extraIndexes?: { fields: IndexDefinition; options?: IndexOptions }[];
  pres?: ((schema: Schema) => (model: Model<DBPart>) => Schema)[];
  logMongoToConsole?: boolean;
  computedFields?: SchemaComputers<ComputedPart, DBPart, any>;
  prepareCache?: boolean;
}

type GetCached<DBPart, ComputedPart> = ComputedPart extends false
  ? false
  : (dbDoc: DBPart) => Promise<ComputedPart>;

export class ExtendedModel<DocI extends Document, ComputedPart = false> {
  public readonly model: Model<DocI>;
  public readonly getCached: GetCached<DocI, ComputedPart>;

  constructor({
    model,
    getCached,
  }: {
    model: Model<DocI>;
    getCached: GetCached<DocI, ComputedPart>;
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

  find(filter?: any, projection?: any, options?: any): any {
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
}

const handleChangeInDBorCahce = async (
  event?: ChangeStreamDocument,
  cacheChange?: string,
) => {
  runTaskWithLock(
    await createRedisInstance(),
    'refreshCacheIfNeeded_' + JSON.stringify(event ?? cacheChange),
    Number.MAX_SAFE_INTEGER,
    async () => {
      if (event) {
        mongoPubSubInstance.publish('mr.allDB', String(Math.random()));
        if ((event as ChangeStreamUpdateDocument).ns?.coll)
          mongoPubSubInstance.publish(
            'mr.db.' + (event as ChangeStreamUpdateDocument).ns.coll,
            String(Math.random()),
          );
        await Promise.all(
          allComputedFields.map(async ({ model, computedFields }) =>
            Promise.all(
              Object.keys(computedFields).map(async (fieldName) =>
                Promise.all(
                  (await model.find()).map(
                    async (doc) =>
                      (event as ChangeStreamUpdateDocument)?.documentKey?._id &&
                      (event as ChangeStreamUpdateDocument).ns &&
                      refreshCacheIfNeeded(
                        doc,
                        String(
                          (event as ChangeStreamUpdateDocument).documentKey._id,
                        ),
                        (event as ChangeStreamUpdateDocument).ns.coll,
                        fieldName,
                        '',
                        computedFields[fieldName],
                        () => {
                          mongoPubSubInstance.publish(
                            'mr.cache.',
                            'mr.cache.' +
                              (event as ChangeStreamUpdateDocument).ns.coll +
                              '.' +
                              fieldName,
                          );
                          mongoPubSubInstance.publish(
                            'mr.cache.' +
                              (event as ChangeStreamUpdateDocument).ns.coll +
                              '.' +
                              fieldName,
                            'mr.cache.' +
                              (event as ChangeStreamUpdateDocument).ns.coll +
                              '.' +
                              fieldName,
                          );
                        },
                      ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      if (cacheChange) {
        mongoPubSubInstance.publish('mr.allDB', String(Math.random()));
        await Promise.all(
          allComputedFields.map(async ({ model, computedFields }) =>
            Promise.all(
              Object.keys(computedFields).map(async (fieldName) =>
                Promise.all(
                  (await model.find()).map(async (doc) =>
                    refreshCacheIfNeeded(
                      doc,
                      '',
                      '',
                      fieldName,
                      cacheChange,
                      computedFields[fieldName],
                      () => {
                        mongoPubSubInstance.publish(
                          'mr.cache.',
                          'mr.cache.' +
                            (event as ChangeStreamUpdateDocument).ns.coll +
                            '.' +
                            fieldName,
                        );
                        mongoPubSubInstance.publish(
                          'mr.cache.' +
                            (event as ChangeStreamUpdateDocument).ns.coll +
                            '.' +
                            fieldName,
                          'mr.cache.' +
                            (event as ChangeStreamUpdateDocument).ns.coll +
                            '.' +
                            fieldName,
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
    },
  );
};

mongoPubSubInstance.subscribe('mr.cache.', (channel) =>
  handleChangeInDBorCahce(undefined, channel),
);

export const getModel = async <DBPart extends DBDoc, ComputedPart = never>(
  name: string,
  schemaDefinition: SchemaDefinition,
  {
    chainToSchema,
    wrapSchema,
    extraIndexes,
    pres,
    logMongoToConsole,
    computedFields,
    prepareCache,
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
    model = connection.instance!.model<DBPart>(name);
  } else {
    model = initModel<DBPart>(connection, name, schema);
    if (computedFields) registerComputedFields({ model, computedFields });
    if (connection.instance?.db) {
      await WatchDB.cancelWholeDBWatch();
      WatchDB.addToWholeDB(
        connection.instance.db,
        async (event: ChangeStreamDocument) => {
          await handleChangeInDBorCahce(event);
        },
      );
    }
  }

  funcs?.map((fnc) => {
    model = initModel<DBPart>(connection, name, fnc(model));
  });

  const getCachedParent: any = {
    getCached: false,
  };
  if (computedFields)
    getCachedParent.getCached = (dbDoc: DBPart) =>
      getCached(dbDoc, computedFields);

  if (computedFields && prepareCache)
    model.find().then(async (docs: DBPart[]) => {
      docs.forEach((doc) => getCached(doc, computedFields));
    });

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

// MongoDB Error Listener
mongoose.connection.on('error', (err: any) => {
  console.error('❌ MongoDB Error:', err.message);
  if (err.message.includes('ECONNRESET')) {
    console.error('❗️ MongoDB connection was reset.');
  }
});
