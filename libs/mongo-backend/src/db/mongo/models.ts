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
} from 'mongoose';
import { versioning } from './autoVersioning';
import { TODO } from '@the-libs/base-shared';
import { mongoSettings } from '../../config';
import { recursivelySignUrls } from '@the-libs/s3-backend';
import { getComputed, invalidate, SchemaComputers } from './computedFields';

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
  extraIndexs?: { fields: IndexDefinition; options?: IndexOptions }[];
  pres?: ((schema: Schema) => (model: Model<DBPart>) => Schema)[];
  logMongoToConsole?: boolean;
  computedFields?: SchemaComputers<ComputedPart>;
}

type GetCahced = (_id: Types.ObjectId) => Promise<Record<string, any>>;

export class ExtendedModel<DocI extends Document> {
  public readonly model: Model<DocI>;
  private readonly getCached?: GetCahced;
  constructor({
    model,
    getCached,
  }: {
    model: Model<DocI>;
    getCached?: GetCahced;
  }) {
    this.model = model;
    this.getCached = getCached;
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        if ((prop in model) as any) {
          // Bind model methods to preserve context
          return typeof (model as any)[prop] === 'function'
            ? ((model as any)[prop] as any).bind(model)
            : (model as any)[prop];
        }
      },
    });
  }

  async findById(id: Types.ObjectId | string): Promise<DocI | null> {
    return this.model.findById(id);
  }

  async find(query: any): Promise<DocI[]> {
    return this.model.find(query);
  }

  async findOne(query: any): Promise<DocI | null> {
    return this.model.findOne(query);
  }

  async create(doc: Partial<DocI>): Promise<DocI> {
    return this.model.create(doc);
  }

  async updateOne(filter: any, update: any): Promise<any> {
    return this.model.updateOne(filter, update);
  }

  async deleteOne(filter: any): Promise<any> {
    return this.model.deleteOne(filter);
  }
}

export const getModel = async <DBPart extends Document, ComputedPart = any>(
  name: string,
  schemaDefinition: SchemaDefinition,
  {
    chainToSchema,
    wrapSchema,
    extraIndexs,
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
  extraIndexs?.forEach((extraIndex) =>
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

  let getCachedParent = {};
  if (computedFields)
    getCachedParent = {
      getCached: async (_id: Types.ObjectId) =>
        getComputed(_id, computedFields),
    };
  computedFields &&
    Object.keys(computedFields).forEach((fieldName) =>
      WatchDB.add({
        modelGetter: async () => model,
        handler: (event) =>
          invalidate(
            event._id,
            fieldName,
            computedFields[fieldName as keyof ComputedPart],
            event,
          ),
      }),
    );

  return new ExtendedModel<DBPart>({
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
