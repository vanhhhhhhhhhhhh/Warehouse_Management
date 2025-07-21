require("../../server");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

function transformValue(value) {
  if (Array.isArray(value)) {
    return value.map(transformValue);
  }

  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0].startsWith('$')) {
      const key = keys[0];
      const inner = value[key];

      switch (key) {
        case '$oid':
          return mongoose.Types.ObjectId.createFromHexString(inner);
        case '$date':
          if (typeof inner === 'string') {
            return new Date(inner);
          } else if (inner.$numberLong) {
            return new Date(parseInt(inner.$numberLong, 10));
          }
          return new Date(inner);
        case '$numberInt':
        case '$numberLong':
        case '$numberDouble':
          return Number(inner);
        case '$binary':
          return Buffer.from(inner.base64, 'base64');
        default:
          return inner;
      }
    }

    const ret = {};
    for (const [k, v] of Object.entries(value)) {
      ret[k] = transformValue(v);
    }
    return ret;
  }

  return value;
}

function readAndParseJSON(path) {
  const raw = fs.readFileSync(path, 'utf8');
  const docs = JSON.parse(raw);
  if (!Array.isArray(docs)) {
    throw new Error('Expected top‑level JSON array');
  }

  return docs.map(transformValue);
}

async function setupDatabase() {
  const db = mongoose.connection;

  const testDataPath = path.join(__dirname, "../test_data");
  const files = fs.readdirSync(testDataPath);

  for (const file of files) {
    if (file.endsWith(".json")) {
      const collectionName = path.basename(file, ".json");
      const data = readAndParseJSON(path.join(testDataPath, file));
      await db.collection(collectionName).insertMany(data);
    }
  }
}

async function tearDownDatabase() {
  const db = mongoose.connection;

  const collections = await db.listCollections();

  for (const collection of collections) {
    await db.collection(collection.name).drop();
  }
}

module.exports = {
  setupDatabase,
  tearDownDatabase
};
