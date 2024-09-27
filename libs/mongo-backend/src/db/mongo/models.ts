import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { WatchDB } from './watch';
import type {
  IndexDefinition,
  IndexOptions,
  Model,
  Schema,
  Connection,
  SchemaDefinition,
} from 'mongoose';
const mongoose = require('mongoose');
import { versioning } from './autoVersioning';
import { TODO } from '@the-libs/base-shared';
import { mongoSettings } from '../../config';
import { getExpressSettings } from '@the-libs/express-backend';

const connection: { instance?: Connection } = {};

export const connect = async <SE = string>(
  mongoURI: string,
  stagingEnv: SE = 'production' as SE,
  logMongoToConsole: boolean = true,
) => {
  stagingEnv === 'local' && mongoose.set('debug', logMongoToConsole);
  try {
    await mongoose.connect(mongoURI);
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
  extraIndexes?: { fields: IndexDefinition; options?: IndexOptions }[];
  pres?: ((schema: Schema) => (model: Model<T>) => Schema)[];
  reconnect?: boolean;
}

export const getModel = async <Interface>(
  name: string,
  schemaDefinition: SchemaDefinition,
  { chainToSchema, extraIndexes, pres, reconnect }: Optional<Interface> = {},
): Promise<Model<Interface>> => {
  if (reconnect) {
    await connect(
      mongoSettings.mongoURI,
      getExpressSettings().stagingEnv,
      false,
    );
  }

  if (!connection.instance) throw new Error('Database not initialized');

  let model: Model<Interface>;
  const schema = new mongoose.Schema(schemaDefinition, {
    timestamps: true,
  });

  chainToSchema?.forEach(({ name, params }) =>
    (schema as any)[name](...params),
  );

  extraIndexes?.forEach((extraIndex) =>
    schema.index(extraIndex.fields, extraIndex.options),
  );

  pres?.forEach((fnc) => fnc(schema));

  if (mongoose.models[name]) {
    model = connection.instance.model<Interface>(name);
  } else {
    model = initModel(connection, name, schema);
  }

  return model;
};
