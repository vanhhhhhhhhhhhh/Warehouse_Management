const router = require('express').Router()
const middleware = require('../controller/middleware')
const errorController = require('../controller/errorController')

router.get('/stockImport', middleware.verifyToken, errorController.listStockImport)

router.post('/declare', middleware.verifyToken, errorController.declareErrorStock)

router.get('/stockError', middleware.verifyToken, errorController.listStockError)

module.exports = router