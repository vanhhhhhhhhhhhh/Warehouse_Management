const router = require('express').Router()
const authController = require('../controller/authController')

router.post('/register', authController.register)

router.post('/login', authController.login)

router.post('/verify-token', authController.verifyToken)

module.exports = router