import { createRequire } from 'module';
import { WatchDB } from './watch';
import type {
  Connection,
  IndexDefinition,
  IndexOptions,
  Model,
  Schema,
  SchemaDefinition,
} from 'mongoose';
import { versioning } from './autoVersioning';
import { TODO } from '@the-libs/base-shared';
import { mongoSettings } from '../../config';
import {
  getExpressSettings,
  StagingEnvironment,
} from '@the-libs/express-backend';

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const connection: { instance?: Connection } = {};

const connect = async (logMongoToConsole: boolean = true) => {
  (getExpressSettings().stagingEnv ?? StagingEnvironment.Prod) ===
    StagingEnvironment.Local &&
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

const initModel = <Interface>(
  connection: {
    instance?: Connection;
  },
  name: string,
  schema: Schema,
) => {
  if (!connection.instance) throw new Error('Database not initialized');
  return connection.instance.model<Interface>(
    name,
    schema.plugin(versioning, { collection: name + 's.history', mongoose }),
  );
};

interface Optional<T> {
  chainToSchema?: { name: TODO; params: TODO[] }[];
  extraIndexs?: { fields: IndexDefinition; options?: IndexOptions }[];
  pres?: ((schema: Schema) => (model: Model<T>) => Schema)[];
  logMongoToConsole?: boolean;
}

export const getModel = async <Interface>(
  name: string,
  schemaDefinition: SchemaDefinition,
  {
    chainToSchema,
    extraIndexs,
    pres,
    logMongoToConsole,
  }: Optional<Interface> = {},
) => {
  if (!connection?.instance) await connect(logMongoToConsole);
  let model: Model<Interface>;
  const schema = new mongoose.Schema(schemaDefinition, {
    timestamps: true,
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
    model = connection!.instance!.model<Interface>(name);
  } else {
    model = initModel(connection, name, schema);
  }

  funcs?.map((fnc) => {
    model = initModel(connection, name, fnc(model));
  });

  return model;
};