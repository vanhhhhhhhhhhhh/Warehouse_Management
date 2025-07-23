const request = require('supertest');
const mongoose = require('mongoose');
const { generateAuthInfoForUsername } = require("./utils/auth");
const { Category } = require('../model');
const app = require('../server');

const { token, user } = generateAuthInfoForUsername("doanything");

describe("Kiểm tra Category", () => {

  describe("Lấy dữ liệu Category", () => {
    it("lấy được tất cả categories", async () => {
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

    it("lấy được categories với bộ lọc tên", async () => {
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

    it("lấy được categories với bộ lọc trạng thái", async () => {
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
  
  describe("Tạo Category", () => {

    it("thất bại nếu tên category trống", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
        
      expect(response.status).toBe(400);
    });

    it("chấp nhận tên category có độ dài tối thiểu (3 ký tự)", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'abc' });
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('abc');
    });

    it("chấp nhận tên category có độ dài bình thường (15 ký tự)", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'a'.repeat(15) });
        
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('a'.repeat(15));
    });

    it("chấp nhận tên category có độ dài tối đa (255 ký tự)", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'a'.repeat(255) });
        
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('a'.repeat(255));
    });

    it("thất bại nếu tên category quá dài (256 ký tự)", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'a'.repeat(256) });
      
      expect(response.status).toBe(400);
    });

    it("thất bại nếu tên category quá ngắn (2 ký tự)", async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'ab' });
      
      expect(response.status).toBe(400);
    });
  });
});
