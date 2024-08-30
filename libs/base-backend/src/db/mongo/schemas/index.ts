import { WatchDB } from '../watch';

export * from './logs/errorLog';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const {
  IndexDefinition,
  IndexOptions,
  Model,
  Schema,
} = require('mongoose');
import { versioning } from '@mnpcmw6444/mongoose-auto-versioning';
import { TODO } from '@the-libs/base-shared';

const connection: { instance?: mongoose.Connection } = {};

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
    instance?: mongoose.Connection;
  },
  name: string,
  schema: mongoose.Schema,
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
}

export const getModel = <Interface>(
  name: string,
  schemaDefinition: mongoose.SchemaDefinition,
  { chainToSchema, extraIndexs, pres }: Optional<Interface> = {},
) => {
  if (!connection.instance) throw new Error('Database not initialized');
  let model: mongoose.Model<Interface>;
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
    model = connection.instance.model<Interface>(name);
  } else {
    model = initModel(connection, name, schema);
  }

  funcs?.map((fnc) => {
    model = initModel(connection, name, fnc(model));
  });

  return model;
};
