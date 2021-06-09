const express = require('express')
const authController = require('../controller/auth.controller')
const router = express.Router()
const multer  = require('multer')
const upload = multer({ dest: 'public/uploads/' })

router.post('/checkLogin', authController.checkLogin)
router.post('/checkRegister', upload.single('avatar'), authController.checkRegister) 
router.get('/register', authController.register)
router.get('/logout', authController.logout)

module.exports = router

