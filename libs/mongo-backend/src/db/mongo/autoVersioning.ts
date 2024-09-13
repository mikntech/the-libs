import type { Document } from 'mongoose';
import { TODO } from '@the-libs/base-shared';

const VERSION = '_version';
const ID = '_id';
const VALIDITY = '_validity';
const EDITOR = '_editor';
const DELETER = '_deleter';
const DEFAULT_EDITOR = 'default';
const DEFAULT_DELETER = 'default';
const SESSION = '_session';

const RESERVED_FIELDS = [VERSION, VALIDITY, EDITOR, DELETER, SESSION];

const constants = {
  VERSION,
  ID,
  VALIDITY,
  EDITOR,
  DELETER,
  DEFAULT_EDITOR,
  DEFAULT_DELETER,
  SESSION,
  RESERVED_FIELDS,
};

const cloneSchema = (schema: TODO, mongoose: TODO) => {
  let clonedSchema = new mongoose.Schema({}, { autoIndex: false });
  schema.eachPath(function (path: TODO, type: TODO) {
    if (path === constants.ID) {
      return;
    }
    let clonedPath: TODO = {};
    clonedPath[path] = type.options;
    clonedPath[path].unique = false;
    if (path !== constants.VERSION) {
      clonedPath[path].required = false;
    }
    clonedSchema.add(clonedPath);
  });
  return clonedSchema;
};

const isWritable = (field: TODO) => {
  return !constants.RESERVED_FIELDS.find((key) => key === field);
};

const isValidVersion = (v: TODO) => {
  if (typeof v != 'string') return false;
  if (isNaN(v as TODO)) return false;
  if (isNaN(parseInt(v))) return false;
  if (parseInt(v) < 1) return false;
  return true;
};

const filterAndModifyOne = async (query: TODO, next: TODO) => {
  let base = await queryOne(query, next);
  if (base === null) next();
  else {
    const session = query.options.session;
    base[constants.SESSION] = session;
    if (!query._update) {
      base[constants.DELETER] =
        query.options[constants.DELETER] || constants.DEFAULT_DELETER;
    } else {
      base[constants.EDITOR] =
        query.options[constants.EDITOR] || constants.DEFAULT_EDITOR;
    }
    await base.save({ session });
    if (query._update && !query._update['$set']) {
      query._update[constants.VERSION] = base[constants.VERSION];
      query._update[constants.VALIDITY] = base[constants.VALIDITY];
    }
  }
  next();
};

const filterAndModifyMany = async (query: TODO, next: TODO) => {
  let bases = await query.model.find(query._conditions);
  const session = query.options.session;
  for (const base of bases) {
    base[constants.SESSION] = session;
    if (!query._update) {
      base[constants.DELETER] =
        query.options[constants.DELETER] || constants.DEFAULT_DELETER;
    } else {
      base[constants.EDITOR] =
        query.options[constants.EDITOR] || constants.DEFAULT_EDITOR;
    }
    await base.save({ session });
  }
  next();
};

const getQueryOptions = (query: TODO) => {
  let sort = {};
  let skip = 0;
  if (query.op.startsWith('find')) {
    sort = query.options.sort || {};
  }
  return { sort, skip };
};

const queryOne = async (query: TODO, next: TODO) => {
  let base = await query.model.findOne(
    query._conditions,
    null,
    getQueryOptions(query),
  );
  return base;
};

export const versioning = (schema: TODO, options: TODO) => {
  if (typeof options == 'string') {
    options = { collection: options };
  }

  options = options || {};
  options.collection = options.collection || 'versions';
  options.mongoose = options.mongoose || require('mongoose');
  const mongoose = options.mongoose;
  const versionedModelName = options.collection;

  schema.add({ deleted: { type: Boolean, default: false } });

  if (!mongoose.models[versionedModelName]) {
    let versionedSchema = cloneSchema(schema, mongoose);
    versionedSchema.add({
      originalId: mongoose.Schema.Types.ObjectId,
      version: Number,
    });
    schema.statics.VersionedModel = mongoose.model(
      versionedModelName,
      versionedSchema,
    );
  } else {
    schema.statics.VersionedModel = mongoose.models[versionedModelName];
  }

  schema.statics.getDocumentHistory = async function (originalId: TODO) {
    return await this.VersionedModel.find({ originalId }).sort({ version: -1 });
  };

  schema.pre('save', async function (this: Document, next: TODO) {
    if (!this.isNew) {
      const previousVersion = this.toObject({ versionKey: false });
      delete previousVersion._id;
      previousVersion.originalId = this._id;
      previousVersion.version = this.__v;
      await schema.statics.VersionedModel.create(previousVersion);
    }
    next();
  });

  schema.pre('findOneAndUpdate', async function (this: Document, next: TODO) {
    const originalDoc = await (this as TODO).model
      .findOne((this as TODO).getQuery())
      .exec();
    if (originalDoc) {
      const previousVersion = originalDoc.toObject({ versionKey: false });
      delete previousVersion._id;
      previousVersion.originalId = originalDoc._id;
      previousVersion.version = originalDoc.__v;
      await schema.statics.VersionedModel.create(previousVersion);
    }
    next();
  });

  schema.pre(
    'deleteOne',
    { document: true, query: false },
    async function (this: Document, next: TODO) {
      (this as TODO)['deleted' as keyof TODO] = true;
      await this.save();
      next();
    },
  );
};
