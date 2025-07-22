const request = require('supertest')
const mongoose = require('mongoose')
const { User } = require('../model/User')
const app = require('../server')


describe('Register API', () => {
    it('Đăng ký thành công với dữ liệu hợp lệ', async () => {
        const response = await request(app).post('/auth/register').send({
            fullName: 'Hire Your Style',
            email: 'style@gmail.com',
            password: 'password123',
            confirmPassword: 'password123',
            phone: '0912345678'
        });
        
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Đăng ký thành công')
    });

    it('Thất bại nếu email đã tồn tại', async () => {
        await request(app).post('/auth/register').send({
            fullName: 'User 1',
            email: 'duplicate@gmail.com',
            password: 'password123',
            confirmPassword: 'password123',
            phone: '0387372837',
        });

        const response = await request(app).post('/auth/register').send({
            fullName: 'User 2',
            email: 'duplicate@gmail.com',
            password: 'password123',
            confirmPassword: 'password123',
            phone: '09111111111'
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toMatch(/Email đã tồn tại/)
    });

    it('Thất bại nếu mật khẩu và xác nhận mật khẩu không khớp', async() => {
        const response = await request(app).post('/auth/register').send({
            fullName: 'YourName',
            email: 'name@gmail.com',
            password: '123456',
            confirmPassword: '654321',
            phone: '0922222222'
        })
        
        expect(response.status).toBe(400)
        expect(response.body.message).toMatch(/Mật khẩu Không khớp/i)
    })

    it('Thất bại nếu số điện thoại không hợp lệ', async() => {
        const response = await request(app).post('/auth/register').send({
            fullName: 'MyName',
            email: 'my@gmail.com',
            password: '123456',
            confirmPassword: '123456',
            phone: 'xyz888'
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toMatch(/Số điện thoại không hợp lệ/)
    })
})


describe('Login with Admin', () => {
    it('Đăng nhập thành công nếu email và mật khẩu chính xác', async() => {
        const res = await request(app).post('/auth/login').send({
            email: 'domdom@gmail.com',
            password: 'domdom'
        })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.token).toBeDefined()
        expect(res.body.user).toHaveProperty('email', 'domdom@gmail.com')
    })

    it('Đăng nhập thất bại nếu email hoặc mật khẩu không đúng', async() => {
        const res = await request(app).post('/auth/login').send({
            email:'domdom@gmail.com',
            password: '12345'
        })

        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
    })
})


describe('Login with Employee', () => {
    it('Đăng nhập thành công nếu email, tên người dùng và mật khẩu chính xác', async() => {
        const res = await request(app).post('/auth/login/employee').send({
            email: 'domdom@gmail.com',
            username: 'doanything',
            password: 'doanything'
        })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.token).toBeDefined()
        expect(res.body.employee).toHaveProperty('email', 'doanything@gmail.com')
    })

    it('Đăng nhập thất bại nếu tên người dùng hoặc mật khẩu không đúng', async() => {
        const res = await request(app).post('/auth/login/employee').send({
            email: 'domdom@gmail.com',
            username: 'doanything',
            password: '123456'
        })

        expect(res.status).toBe(400)
    })

    it('Đăng nhập thất bại nếu email quản trị viên không khớp', async() => {
        const res = await request(app).post('/auth/login/employee').send({
            email: 'admin@gmail.com',
            username: 'doanything',
            password: 'doanything'
        })

        expect(res.status).toBe(400)
    })
})
