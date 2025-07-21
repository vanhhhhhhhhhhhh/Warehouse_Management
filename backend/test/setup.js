const mongoose = require('mongoose');
const { setupDatabase, tearDownDatabase } = require('./utils/dbSetup');

beforeEach(async () => {
  await setupDatabase();
});

afterEach(async () => {
  await tearDownDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
}); 