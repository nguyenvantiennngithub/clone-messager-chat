const express = require('express')
const homeController = require('../controller/home.controller')
const middleware = require('../../middleware/index.middleware')

const router = express.Router()

router.get('/', homeController.home)
router.get('/chat', middleware.checkAuth, homeController.chat1)
router.get('/chat/:id', middleware.checkAuth, homeController.chat)
router.post('/add-chat-list', homeController.addChatList)
router.post('/hide-chat-list', homeController.hideChatList)

module.exports = router
