const express = require('express')
const homeController = require('../controller/home.controller')
const authController = require('../controller/auth.controller')
const middleware = require('../../middleware/index.middleware')

const router = express.Router()

router.get('/', middleware.isLogin, homeController.home)
router.get('/chat', middleware.checkAuth, homeController.chat)
router.post('/change-name', middleware.checkAuth, homeController.changeName)
router.post('/appoint-admin', middleware.checkAuth, homeController.appointAdmin)
router.post('/add-chat-list', middleware.checkAuth, homeController.addChatList)
router.post('/add-group-chat', middleware.checkAuth, homeController.addGroupChat)
router.post('/hide-chat-list', middleware.checkAuth, homeController.hideChatList)
router.post('/kick-out-group', middleware.checkAuth, homeController.kickOutGroup)
router.post('/create-group-chat', middleware.checkAuth, homeController.createGroupChat)
router.post('/set-updatedAt-group-chat', middleware.checkAuth, homeController.setUpdatedGroupChat)
router.get('/chat/:idroom', middleware.checkAuth, homeController.chat)

module.exports = router
