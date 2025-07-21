const request = require('supertest');
const mongoose = require('mongoose');
const { setupDatabase, tearDownDatabase } = require("./utils/dbSetup");
const { generateAuthInfoForUsername } = require("./utils/auth");
const { Category } = require('../model');
const app = require('../server');

const { token, user } = generateAuthInfoForUsername("doanything");

beforeEach(async () => {
  await setupDatabase();
});

afterEach(async () => {
  await tearDownDatabase();
});

describe("Category Tests", () => {
  
  describe("Category Name", () => {
    
    it("should reject empty category name", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
      
      expect(response.status).toBe(400);
    });

    it("should reject null category name", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: null });
      
      expect(response.status).toBe(400);
    });

    it("should reject undefined category name", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      expect(response.status).toBe(400);
    });

    it("should accept minimum length category name (1 character)", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'A' });
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('A');
    });

    it("should accept very long category name (boundary test)", async () => {
      const longName = 'A'.repeat(1000);
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: longName });
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(longName);
    });

    it("should handle extremely long category name (stress test)", async () => {
      const extremeLongName = 'A'.repeat(10000);
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: extremeLongName });
      
      expect([201, 400, 413]).toContain(response.status);
    });
  });

  describe("ID", () => {
    
    it("should reject invalid ObjectId format", async () => {
      const response = await request(app)
        .get('/categories/invalid-id')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(500);
    });

    it("should handle valid but non-existent ObjectId", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
    });

    it("should handle ObjectId edge case - all zeros", async () => {
      const response = await request(app)
        .get('/categories/000000000000000000000000')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
    });

    it("should handle ObjectId edge case - all fs", async () => {
      const response = await request(app)
        .get('/categories/ffffffffffffffffffffffff')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe("Bulk Operations", () => {
    
    it("should handle empty array for bulk deactivation", async () => {
      const response = await request(app)
        .post('/categories/deactivate')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] });
      
      expect(response.status).toBe(200);
    });

    it("should handle single ID for bulk operations", async () => {
      const category = await Category.create({
        name: 'Test Category',
        adminId: user.adminId
      });

      const response = await request(app)
        .post('/categories/deactivate')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [category._id] });
      
      expect(response.status).toBe(200);
    });
  });
});
