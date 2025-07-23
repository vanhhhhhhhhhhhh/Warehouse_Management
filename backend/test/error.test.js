const request = require('supertest')
const { generateAuthInfoForUsername } = require('./utils/auth')
const Stock_Import = require('../model/Stock_Import')
const Stock_Error = require('../model/Stock_Error')
const app = require('../server')

const { token, user } = generateAuthInfoForUsername('doanything')

describe('Khai báo sản phẩm', () => {

})
