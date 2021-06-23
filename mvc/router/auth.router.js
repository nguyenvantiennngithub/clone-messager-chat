const express = require('express')
const router = express.Router()
const authController = require('../controller/auth.controller')
const loginFacebook = require('../../helpers/loginFacebook')
const passport = require('passport')

router.post('/checkLogin', authController.checkLogin)
router.post('/checkRegister', authController.checkRegister) 
router.get('/register', authController.register)
router.get('/logout', authController.logout)
router.get('/facebook', passport.authenticate('facebook'))
router.get('/facebook/login', passport.authenticate('facebook', { failureRedirect: '/sdadas'}), function(req, res){
    console.log('req.user', req.user)
    req.session.username = req.user.username
    req.session.isAuth = true;
    res.redirect("/chat")
})
module.exports = router

