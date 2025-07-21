const request = require('supertest');
const mongoose = require('mongoose');
const { generateAuthInfoForUsername } = require("./utils/auth");
const { Category } = require('../model');
const app = require('../server');

const { token, user } = generateAuthInfoForUsername("doanything");

describe("Category Tests", () => {

  describe("Category Fetching", () => {
    it("should fetch all categories", async () => {
      const response = await request(app)
        .get('/categories')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.totalPages).toEqual(expect.any(Number));
      expect(response.body.data).toEqual(
        expect.arrayOf(
          expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
            isDelete: expect.any(Boolean),
            createdAt: expect.any(String)
          })
        )
      )
    });

    it("should fetch categories with name filter", async () => {
      const response = await request(app)
        .get('/categories')
        .set('Authorization', `Bearer ${token}`)
        .query({ name: 'Nước giải khát' });
        
      expect(response.status).toBe(200);
      expect(response.body.totalPages).toEqual(expect.any(Number));
      expect(response.body.data).toEqual(
        expect.arrayOf(
          expect.objectContaining({
            _id: expect.any(String),
            name: 'Nước giải khát',
            isDelete: expect.any(Boolean),
            createdAt: expect.any(String)
          })
        )
      )
    });

    it("should fetch categories with status filter", async () => {
      const response = await request(app)
        .get('/categories')
        .set('Authorization', `Bearer ${token}`)
        .query({ status: 'active' });

      expect(response.status).toBe(200);
      expect(response.body.totalPages).toEqual(expect.any(Number));
      expect(response.body.data).toEqual(
        expect.arrayOf(
          expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
            isDelete: false,
            createdAt: expect.any(String)
          })
        )
      )
    });
  });
  
  describe("Category Creation", () => {

    it("should reject empty category name", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
        
      expect(response.status).toBe(400);
    });

    it("should accept minimum length category name (3 character)", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'abc' });
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('abc');
    });

    it("should accept normal length category name (15 characters)", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'a'.repeat(15) });
        
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('a'.repeat(15));
    });

    it("should accept maximum length category name (255 characters)", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'a'.repeat(255) });
        
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('a'.repeat(255));
    });

    it("should reject category name that is too long (256 characters)", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'a'.repeat(256) });
      
      expect(response.status).toBe(400);
    });

    it("should reject category name that is too short (2 characters)", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'ab' });
      
      expect(response.status).toBe(400);
    });
  });
});
