const request = require('supertest')
const mongoose = require('mongoose')
const { generateAuthInfoForUsername } = require('./utils/auth')
const Warehouse = require('../model/Warehouse')
const Stock_Import = require('../model/Stock_Import')
const app = require('../server')

const { token, user } = generateAuthInfoForUsername('doanything')

describe('Nhập kho', () => {
    let testWareId
    let testWareIdNotExist = '687e029c45f8929a4f5d3922'
    let testProIdNotExist = '527e029c45f8929a4f5d390a'

    beforeEach(async () => {
        const existWare = await Warehouse.findOne({ name: 'Kho Test Jest' })
        if (existWare) {
            testWareId = existWare._id
        } else {
            const newWare = await Warehouse.create({
                name: 'Kho Test Jest',
                address: {
                    city: 'Thành phố Hồ Chí Minh',
                    district: 'Quận 1',
                    ward: 'Phường Bến Nghé',
                    detail: 'Số 999, đường Test'
                },
                phone: '0912345678',
                adminId: user.adminId || user._id,
                staffId: user._id,
                isActive: true,
                isDelete: false
            })
            testWareId = newWare._id
        }
    })

    describe('Nhập sản phẩm vào kho', () => {
        it('Nhập kho thành công với dữ liệu hợp lệ', async () => {
            const response = await request(app).post('/import/intoWarehouse')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    receiptCode: 'IMP003',
                    receiptName: 'Phiếu nhập kho Ha Noi 2',
                    wareId: testWareId,
                    items: [
                        {
                            proId: '687e029c45f8929a4f5d3906',
                            quantity: 3
                        }
                    ]
                })

            expect(response.status).toBe(201)
            expect(response.body.success).toBe(true)
        });

        it('Trả về 401 nếu chưa cung cấp token', async () => {
            const response = await request(app).post('/import/intoWarehouse')

            expect(response.status).toBe(401)
        });

        it('Thất bại nếu không nhập đủ các trường', async () => {
            const response = await request(app).post('/import/intoWarehouse')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    receiptCode: 'IMP005',
                })

            expect(response.status).toBe(400)
        });

        it('Thất bại nếu mã phiếu đã tồn tại trong kho', async () => {
            const response = await request(app).post('/import/intoWarehouse')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    receiptCode: 'IMP002',
                    receiptName: 'Phiếu nhập kho Ha Noi 2',
                    wareId: testWareId,
                    items: [
                        {
                            proId: '687e029c45f8929a4f5d3906',
                            quantity: 1
                        }
                    ]
                })

            expect(response.status).toBe(400)
        });

        it('Thất bại nếu kho không tồn tại trong hệ thống', async () => {
            const response = await request(app).post('/import/intoWarehouse')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    receiptCode: 'IMP008',
                    receiptName: 'Phiếu nhập kho Ha Noi',
                    wareId: testWareIdNotExist,
                    items: [
                        {
                            proId: '687e029c45f8929a4f5d3906',
                            quantity: 1
                        }
                    ]
                })

            expect(response.status).toBe(404)
        });

        it('Thất bại nếu không nhập đầy đủ các trường thuộc items', async () => {
            const response = await request(app).post('/import/intoWarehouse')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    receiptCode: 'Not Exist',
                    receiptName: 'Phiếu nhập kho Ha Noi',
                    wareId: testWareId,
                    items: [
                        {
                            proId: '687e029c45f8929a4f5d3906',
                        }
                    ]
                })

            expect(response.status).toBe(400)
        });

        it('Thất bại nếu sản phẩm không tồn tại', async () => {
            const response = await request(app).post('/import/intoWarehouse')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    receiptCode: 'IMP003',
                    receiptName: 'Phiếu nhập kho Ha Noi 2',
                    wareId: testWareId,
                    items: [
                        {
                            proId: testProIdNotExist,
                            quantity: 3
                        }
                    ]
                })

                expect(response.status).toBe(404)
        });

        it('Thất bại nếu số lượng sản phẩm bé hơn hoặc bằng 0', async() => {
            const response = await request(app).post('/import/intoWarehouse')
            .set('Authorization', `Bearer ${token}`)
            .send({
                    receiptCode: 'IMP010',
                    receiptName: 'Phiếu nhập kho Ha Noi 99',
                    wareId: testWareId,
                    items: [
                        {
                            proId: '687e029c45f8929a4f5d3906',
                            quantity: -1
                        }
                    ]
            })

            expect(response.status).toBe(400)
        });

    });

    describe('Lịch sử nhập kho', () => {
        it('Trả về danh sách lịch sử nhập kho', async () => {
            const response = await request(app).get('/import/history')
                .set('Authorization', `Bearer ${token}`)

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body.data)).toBe(true)

            if (response.body.data.length > 0) {
                const importRecord = response.body.data[0]
                expect(importRecord).toHaveProperty('receiptCode')
                expect(importRecord).toHaveProperty('items')
            }
        });

        it('Trả về 401 nếu chưa cung cấp token', async () => {
            const response = await request(app).get('/import/history')

            expect(response.status).toBe(401)
        })
    })
})