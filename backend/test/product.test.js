const request = require('supertest');
const mongoose = require('mongoose');
const { generateAuthInfoForUsername } = require("./utils/auth");
const { Product, Category } = require('../model');
const app = require('../server');

const { token, user } = generateAuthInfoForUsername("doanything");
const VALID_BUT_NON_EXISTENT_CATEGORY_ID = "687a44fe98bfc3565529771a";
const COMMON_CATEGORY_ID = "682f5ab72ae602f40e97328d";
const COMMON_PRODUCT_NAME = "Test Product";
const COMMON_PRODUCT_CODE = "TEST_PRODUCT";
const COMMON_PRODUCT_PRICE = 100;

describe("Kiểm tra Product", () => {
  describe("Lấy dữ liệu Product", () => {
    it("lấy được tất cả products", async () => {
      const response = await request(app)
        .get('/products')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.totalPages).toEqual(expect.any(Number));
      expect(response.body.data).toEqual(
        expect.arrayOf(
          expect.objectContaining({
            _id: expect.any(String),
            code: expect.any(String),
            name: expect.any(String), 
            category: expect.any(String),
            price: expect.any(Number),
            isDelete: expect.any(Boolean),
            adminId: user.adminId
          })
        )
      );
    });

    it("lấy được products với bộ lọc tên", async () => {
      const response = await request(app)
        .get('/products')
        .set('Authorization', `Bearer ${token}`)
        .query({ name: 'TH True Milk' });
        
      expect(response.status).toBe(200);
      expect(response.body.totalPages).toEqual(expect.any(Number));
      expect(response.body.data).toEqual(
        expect.arrayOf(
          expect.objectContaining({
            _id: expect.any(String),
            code: expect.any(String),
            name: 'TH True Milk',
            category: expect.any(String),
            price: expect.any(Number),
            isDelete: expect.any(Boolean),
            adminId: user.adminId
          })
        )
      );
    });

    it("lấy được products với bộ lọc trạng thái", async () => {
      const response = await request(app)
        .get('/products')
        .set('Authorization', `Bearer ${token}`)
        .query({ status: 'active' });

      expect(response.status).toBe(200);
      expect(response.body.totalPages).toEqual(expect.any(Number));
      expect(response.body.data).toEqual(
        expect.arrayOf(
          expect.objectContaining({
            _id: expect.any(String),
            code: expect.any(String),
            name: expect.any(String),
            category: expect.any(String),
            price: expect.any(Number),
            isDelete: false,
            adminId: user.adminId
          })
        )
      );
    });
  });

  it("Tạo Product - tạo thành công với tất cả các truòng bắt buộc", async () => {
    const response = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        code: COMMON_PRODUCT_CODE,
        name: COMMON_PRODUCT_NAME,
        categoryId: COMMON_CATEGORY_ID,
        price: COMMON_PRODUCT_PRICE
      });
      
    expect(response.status).toBe(201);
    expect(response.body.code).toBe(COMMON_PRODUCT_CODE);
  });
  
  describe("Tạo Product - Kiểm tra mã sản phẩm", () => {
    it("thất bại nếu mã sản phẩm trống", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: '',
          name: COMMON_PRODUCT_NAME,
          categoryId: COMMON_CATEGORY_ID,
          price: COMMON_PRODUCT_PRICE
        });
        
      expect(response.status).toBe(400);
    });

    it("thất bại nếu mã sản phẩm bị trùng lặp", async () => {
      const duplicateCode = 'PRO-106';

      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: duplicateCode,
          name: COMMON_PRODUCT_NAME,
          categoryId: COMMON_CATEGORY_ID,
          price: COMMON_PRODUCT_PRICE
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe("Tạo Product - Kiểm tra tên sản phẩm", () => {
    it("thất bại nếu tên sản phẩm trống", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: '',
          categoryId: COMMON_CATEGORY_ID,
          price: COMMON_PRODUCT_PRICE
        });
        
      expect(response.status).toBe(400);
    });
  });

  describe("Tạo Product - Kiểm tra mô tả sản phẩm", () => {
    it("chấp nhận mô tả trống", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: COMMON_PRODUCT_NAME,
          categoryId: COMMON_CATEGORY_ID,
          price: COMMON_PRODUCT_PRICE,
          description: ''
        });
      
      expect(response.status).toBe(201);
    });

    it("chấp nhận mô tả có độ dài bình thường (100 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: COMMON_PRODUCT_NAME,
          categoryId: COMMON_CATEGORY_ID,
          price: COMMON_PRODUCT_PRICE,
          description: 'd'.repeat(100)
        });
        
      expect(response.status).toBe(201);
      expect(response.body.description).toBe('d'.repeat(100));
    });
  });

  describe("Tạo Product - Kiểm tra giá sản phẩm", () => {
    it("chấp nhận giá bằng không", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: COMMON_PRODUCT_NAME,
          categoryId: COMMON_CATEGORY_ID,
          price: 0
        });
      
      expect(response.status).toBe(201);
      expect(response.body.price).toBe(0);
    });


    it("thất bại nếu giá âm", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: COMMON_PRODUCT_NAME,
          categoryId: COMMON_CATEGORY_ID,
          price: -10
        });
      
      expect(response.status).toBe(400);
    });

    it("xử lý chuyển đổi giá từ chuỗi", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: COMMON_PRODUCT_NAME,
          categoryId: COMMON_CATEGORY_ID,
          price: "50.5"
        });
      
      expect(response.status).toBe(201);
      expect(response.body.price).toBe(50.5);
    });

    it("thất bại nếu giá không phải số", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: COMMON_PRODUCT_NAME,
          categoryId: COMMON_CATEGORY_ID,
          price: "abc"
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe("Tạo Product - Kiểm tra category", () => {
    it("thất bại nếu sản phẩm không có category", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: COMMON_PRODUCT_NAME,
          price: COMMON_PRODUCT_PRICE
        });
      
      expect(response.status).toBe(400);
    });

    it("thất bại nếu sản phẩm có category ID không tồn tại", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: COMMON_PRODUCT_NAME,
          categoryId: VALID_BUT_NON_EXISTENT_CATEGORY_ID,
          price: COMMON_PRODUCT_PRICE
        });

      expect(response.status).toBe(400);
    });
  });

  describe("Tạo Product - Kiểm tra thuộc tính sản phẩm", () => {
    it("chấp nhận thuộc tính hợp lệ", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: COMMON_PRODUCT_NAME,
          categoryId: COMMON_CATEGORY_ID,
          price: COMMON_PRODUCT_PRICE,
          attributes: [
            { name: 'Color', value: 'Red' },
            { name: 'Size', value: 'Large' }
          ]
        });
      
      expect(response.status).toBe(201);
      expect(response.body.attributes).toHaveLength(2);
    });


    it("thất bại nếu thuộc tính thiếu tên", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: COMMON_PRODUCT_NAME,
          categoryId: COMMON_CATEGORY_ID,
          price: COMMON_PRODUCT_PRICE,
          attributes: [
            { value: 'Valid Value' }
          ]
        });
      
      expect(response.status).toBe(400);
    });

    it("thất bại nếu thuộc tính thiếu giá trị", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: COMMON_PRODUCT_CODE,
          name: COMMON_PRODUCT_NAME,
          categoryId: COMMON_CATEGORY_ID,
          price: COMMON_PRODUCT_PRICE,
          attributes: [
            { name: 'Valid Name' }
          ]
        });
      
      expect(response.status).toBe(400);
    });
  });
});
