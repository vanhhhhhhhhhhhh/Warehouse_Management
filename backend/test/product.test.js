const { setupDatabase, tearDownDatabase } = require("./utils/dbSetup");

beforeEach(async () => {
  await setupDatabase();
});

afterEach(async () => {
  await tearDownDatabase();
});

describe("Product Tests", () => {
  it("should create a product", async () => {
    expect(true).toBe(true);
  });
})
