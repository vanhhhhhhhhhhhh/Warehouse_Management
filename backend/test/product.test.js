const request = require('supertest');
const mongoose = require('mongoose');
const { generateAuthInfoForUsername } = require("./utils/auth");
const { Product, Category } = require('../model');
const app = require('../server');

const { token, user } = generateAuthInfoForUsername("doanything");
const VALID_BUT_NON_EXISTENT_CATEGORY_ID = "687a44fe98bfc3565529771a";

describe("Kiểm tra Product", () => {
  let testCategoryId;

  beforeEach(async () => {
    const testCategory = new Category({
      name: 'Test Category for Products',
      adminId: user.adminId
    });
    const savedCategory = await testCategory.save();
    testCategoryId = savedCategory._id;
  });

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
        .query({ name: 'test' });
        
      expect(response.status).toBe(200);
      expect(response.body.totalPages).toEqual(expect.any(Number));
      expect(response.body.data).toEqual(
        expect.arrayOf(
          expect.objectContaining({
            _id: expect.any(String),
            code: expect.any(String),
            name: expect.any(String),
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
            isDelete: false,
            adminId: user.adminId
          })
        )
      );
    });
  });
  
  describe("Tạo Product - Kiểm tra mã sản phẩm", () => {
    it("thất bại nếu mã sản phẩm trống", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: '',
          name: 'Test Product',
          categoryId: testCategoryId,
          price: 100
        });
        
      expect(response.status).toBe(400);
    });

    it("chấp nhận mã sản phẩm có độ dài tối thiểu (3 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'abc',
          name: 'Test Product Min Code',
          categoryId: testCategoryId,
          price: 100
        });
      
      expect(response.status).toBe(201);
      expect(response.body.code).toBe('abc');
    });

    it("chấp nhận mã sản phẩm có độ dài bình thường (15 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'c'.repeat(15),
          name: 'Test Product Normal Code',
          categoryId: testCategoryId,
          price: 100
        });
        
      expect(response.status).toBe(201);
      expect(response.body.code).toBe('c'.repeat(15));
    });

    it("chấp nhận mã sản phẩm có độ dài tối đa (255 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'd'.repeat(255),
          name: 'Test Product Max Code',
          categoryId: testCategoryId,
          price: 100
        });
        
      expect(response.status).toBe(201);
      expect(response.body.code).toBe('d'.repeat(255));
    });

    it("thất bại nếu mã sản phẩm quá dài (256 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'e'.repeat(256),
          name: 'Test Product Too Long Code',
          categoryId: testCategoryId,
          price: 100
        });
      
      expect(response.status).toBe(400);
    });

    it("thất bại nếu mã sản phẩm quá ngắn (2 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'ab',
          name: 'Test Product Too Short Code',
          categoryId: testCategoryId,
          price: 100
        });
      
      expect(response.status).toBe(400);
    });

    it("thất bại nếu mã sản phẩm bị trùng lặp", async () => {
      const duplicateCode = 'DUPLICATE123';
      
      await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: duplicateCode,
          name: 'First Product',
          categoryId: testCategoryId,
          price: 100
        });

      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: duplicateCode,
          name: 'Second Product',
          categoryId: testCategoryId,
          price: 200
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
          code: 'EMPTY_NAME',
          name: '',
          categoryId: testCategoryId,
          price: 100
        });
        
      expect(response.status).toBe(400);
    });

    it("chấp nhận tên sản phẩm có độ dài tối thiểu (3 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'MIN_NAME',
          name: 'abc',
          categoryId: testCategoryId,
          price: 100
        });
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('abc');
    });

    it("chấp nhận tên sản phẩm có độ dài bình thường (15 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'NORMAL_NAME',
          name: 'n'.repeat(15),
          categoryId: testCategoryId,
          price: 100
        });
        
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('n'.repeat(15));
    });

    it("chấp nhận tên sản phẩm có độ dài tối đa (255 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'MAX_NAME',
          name: 'x'.repeat(255),
          categoryId: testCategoryId,
          price: 100
        });
        
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('x'.repeat(255));
    });

    it("thất bại nếu tên sản phẩm quá dài (256 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'TOO_LONG_NAME',
          name: 'y'.repeat(256),
          categoryId: testCategoryId,
          price: 100
        });
      
      expect(response.status).toBe(400);
    });

    it("thất bại nếu tên sản phẩm quá ngắn (2 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'TOO_SHORT_NAME',
          name: 'ab',
          categoryId: testCategoryId,
          price: 100
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
          code: 'NO_DESC',
          name: 'Product Without Description',
          categoryId: testCategoryId,
          price: 100,
          description: ''
        });
      
      expect(response.status).toBe(201);
    });

    it("chấp nhận mô tả có độ dài bình thường (100 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'NORMAL_DESC',
          name: 'Product Normal Description',
          categoryId: testCategoryId,
          price: 100,
          description: 'd'.repeat(100)
        });
        
      expect(response.status).toBe(201);
      expect(response.body.description).toBe('d'.repeat(100));
    });

    it("chấp nhận mô tả có độ dài tối đa (1000 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'MAX_DESC',
          name: 'Product Max Description',
          categoryId: testCategoryId,
          price: 100,
          description: 'z'.repeat(1000)
        });
        
      expect(response.status).toBe(201);
      expect(response.body.description).toBe('z'.repeat(1000));
    });

    it("thất bại nếu mô tả quá dài (1001 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'TOO_LONG_DESC',
          name: 'Product Too Long Description',
          categoryId: testCategoryId,
          price: 100,
          description: 'w'.repeat(1001)
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe("Tạo Product - Kiểm tra giá sản phẩm", () => {
    it("chấp nhận giá bằng không", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'ZERO_PRICE',
          name: 'Free Product',
          categoryId: testCategoryId,
          price: 0
        });
      
      expect(response.status).toBe(201);
      expect(response.body.price).toBe(0);
    });

    it("chấp nhận giá dương", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'POSITIVE_PRICE',
          name: 'Paid Product',
          categoryId: testCategoryId,
          price: 99.99
        });
      
      expect(response.status).toBe(201);
      expect(response.body.price).toBe(99.99);
    });

    it("thất bại nếu giá âm", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'NEGATIVE_PRICE',
          name: 'Invalid Price Product',
          categoryId: testCategoryId,
          price: -10
        });
      
      expect(response.status).toBe(400);
    });

    it("xử lý chuyển đổi giá từ chuỗi", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'STRING_PRICE',
          name: 'String Price Product',
          categoryId: testCategoryId,
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
          code: 'NON_NUMERIC_PRICE',
          name: 'Non-Numeric Price Product',
          categoryId: testCategoryId,
          price: "abc"
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe("Tạo Product - Kiểm tra category", () => {
    it("chấp nhận category ID hợp lệ", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'VALID_CATEGORY',
          name: 'Product with Category',
          categoryId: testCategoryId,
          price: 100
        });
      
      expect(response.status).toBe(201);
      expect(response.body.categoryId).toBe(testCategoryId.toString());
    });

    it("thất bại nếu sản phẩm không có category", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'NO_CATEGORY',
          name: 'Product without Category',
          price: 100
        });
      
      expect(response.status).toBe(400);
    });

    it("thất bại nếu sản phẩm có category ID không tồn tại", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'NON_EXISTENT_CATEGORY',
          name: 'Product with Non-Existent Category',
          categoryId: VALID_BUT_NON_EXISTENT_CATEGORY_ID,
          price: 100
        });

      expect(response.status).toBe(400);
    });

    it("thất bại nếu định dạng category ID không hợp lệ", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'INVALID_CATEGORY',
          name: 'Product with Invalid Category',
          categoryId: 'invalid-id',
          price: 100
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
          code: 'VALID_ATTRS',
          name: 'Product with Attributes',
          categoryId: testCategoryId,
          price: 100,
          attributes: [
            { name: 'Color', value: 'Red' },
            { name: 'Size', value: 'Large' }
          ]
        });
      
      expect(response.status).toBe(201);
      expect(response.body.attributes).toHaveLength(2);
    });

    it("chấp nhận sản phẩm không có thuộc tính", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'NO_ATTRS',
          name: 'Product without Attributes',
          categoryId: testCategoryId,
          price: 100
        });
      
      expect(response.status).toBe(201);
    });

    it("chấp nhận mảng thuộc tính trống", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'EMPTY_ATTRS',
          name: 'Product with Empty Attributes',
          categoryId: testCategoryId,
          price: 100,
          attributes: []
        });
      
      expect(response.status).toBe(201);
    });

    it("chấp nhận tên và giá trị thuộc tính có độ dài tối đa (255 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'MAX_ATTR_LENGTH',
          name: 'Product with Max Length Attributes',
          categoryId: testCategoryId,
          price: 100,
          attributes: [
            { name: 'a'.repeat(255), value: 'b'.repeat(255) }
          ]
        });
      
      expect(response.status).toBe(201);
    });

    it("thất bại nếu tên thuộc tính quá dài (256 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'LONG_ATTR_NAME',
          name: 'Product with Long Attribute Name',
          categoryId: testCategoryId,
          price: 100,
          attributes: [
            { name: 'c'.repeat(256), value: 'Valid Value' }
          ]
        });
      
      expect(response.status).toBe(400);
    });

    it("thất bại nếu giá trị thuộc tính quá dài (256 ký tự)", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'LONG_ATTR_VALUE',
          name: 'Product with Long Attribute Value',
          categoryId: testCategoryId,
          price: 100,
          attributes: [
            { name: 'Valid Name', value: 'd'.repeat(256) }
          ]
        });
      
      expect(response.status).toBe(400);
    });

    it("thất bại nếu thuộc tính thiếu tên", async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          code: 'MISSING_ATTR_NAME',
          name: 'Product with Missing Attribute Name',
          categoryId: testCategoryId,
          price: 100,
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
          code: 'MISSING_ATTR_VALUE',
          name: 'Product with Missing Attribute Value',
          categoryId: testCategoryId,
          price: 100,
          attributes: [
            { name: 'Valid Name' }
          ]
        });
      
      expect(response.status).toBe(400);
    });
  });
});
