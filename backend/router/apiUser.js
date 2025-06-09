const router = require('express').Router()
const userController = require('../controller/userController')
const middlewareController = require('../controller/middleware')

router.post('/', middlewareController.verifyToken, userController.createStaff)
router.get('/', middlewareController.verifyToken, userController.getAllStaff)
router.put('/:userId', middlewareController.verifyToken, userController.updateStaff)
router.get('/:userId', middlewareController.verifyToken, userController.getStaffById)
router.delete('/:userId', middlewareController.verifyToken, userController.deleteStaff)

module.exports = router