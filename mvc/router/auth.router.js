const express = require('express')
const router = express.Router()
const authController = require('../controller/auth.controller')
const passport = require('passport')

router.post('/checkLogin', authController.checkLogin)
router.post('/checkRegister', authController.checkRegister) 
router.get('/register', authController.register)
router.get('/logout', authController.logout)

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/login', passport.authenticate('google', { failureRedirect: '/' }), authController.checkLoginSocial);

router.get('/facebook', passport.authenticate('facebook'))
router.get('/facebook/login', passport.authenticate('facebook', { failureRedirect: '/home'}), authController.checkLoginSocial)
module.exports = router

