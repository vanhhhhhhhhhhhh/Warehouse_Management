const express = require('express')
const router = express.Router()
const productController = require('../controller/productController')

// Routes
router.get('/', productController.listProduct)
router.get('/:id', productController.getProduct)
router.post('/', productController.createProduct)
router.put('/:id', productController.updateProduct)
router.post('/deactivate', productController.deactivateProduct)
router.post('/activate', productController.activateProduct)

module.exports = router
