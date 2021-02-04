const express = require('express')
const homeController = require('../controller/home.controller')
const middleware = require('../../middleware/index.middleware')

const router = express.Router()

router.get('/', homeController.home)
router.get('/chat',middleware.checkAuth, homeController.chat)

module.exports = router
