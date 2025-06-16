const express = require('express')
const router = express.Router()
const categoryController = require('../controller/categoryController')

router.get('/', categoryController.listCategory)
router.get('/:id', categoryController.getCategory)
router.post('/', categoryController.createCategory)
router.put('/:id', categoryController.updateCategory)
router.post('/deactivate', categoryController.deactivateCategories)
router.post('/activate', categoryController.activateCategories)

module.exports = router
