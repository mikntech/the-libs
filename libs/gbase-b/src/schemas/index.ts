import mongoose, { Model, SchemaDefinition } from 'mongoose';
import { versioning } from '@mnpcmw6444/mongoose-auto-versioning';

const connection: { instance?: mongoose.Connection } = {};

export const connect = async <SE = string>(
  mongoURI: string,
  stagingEnv: SE = 'production' as SE,
  watchDB?: () => void
) => {
  stagingEnv === 'local' && mongoose.set('debug', true);
  try {
    await mongoose.connect(mongoURI);
    console.log('Mongo DB connected successfully');
    connection.instance = mongoose.connection;
    watchDB && watchDB();
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
  schema: mongoose.Schema
) => {
  if (!connection.instance) throw new Error('Database not initialized');
  return connection.instance.model<Interface>(
    name,
    schema.plugin(versioning, { collection: name + 's.history', mongoose })
  );
};

export const getModel = <Interface>(
  name: string,
  schemaDefinition: SchemaDefinition,
  extraIndex = undefined
) => {
  if (!connection.instance) throw new Error('Database not initialized');
  let model: Model<Interface>;
  const schema = new mongoose.Schema(schemaDefinition, {
    timestamps: true,
  });
  extraIndex && schema.index(extraIndex);
  if (mongoose.models[name]) {
    model = connection.instance.model<Interface>(name);
  } else {
    model = initModel(connection, name, schema);
  }
  return model;
};
