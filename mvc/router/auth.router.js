const express = require('express')
const authController = require('../controller/auth.controller')
const router = express.Router()

router.post('/checkLogin', authController.checkLogin)
router.post('/checkRegister', authController.checkRegister)
router.get('/register', authController.register)
router.get('/logout', authController.logout)

module.exports = router

