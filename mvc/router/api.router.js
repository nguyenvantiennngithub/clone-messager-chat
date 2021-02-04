const express = require('express')
const apiController = require('../controller/api.controller')

const router = express.Router()

router.get('/users', apiController.user)

module.exports = router
