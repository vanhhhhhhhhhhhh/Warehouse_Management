require("../../server");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

function readAndParseJSON(path) {
  const rawData = fs.readFileSync(path, "utf8");
  const parsed = JSON.parse(rawData);

  return parsed.map(doc => {
    for (const [key, value] of Object.entries(doc)) {
      const keys = Object.keys(value);
      if (keys[0] && keys[0].startsWith("$")) {
        if (keys[0] === "$oid") {
          doc[key] = mongoose.Types.ObjectId.createFromHexString(value[keys[0]]);
        } else {
          doc[key] = value[keys[0]];
        }
      }
    }
    return doc;
  });
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
    await db.collection(collection.name).deleteMany({});
  }
}

module.exports = {
  setupDatabase,
  tearDownDatabase
};
