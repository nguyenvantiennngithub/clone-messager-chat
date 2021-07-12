const express = require('express')
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const db = require('../db/connect.db')
const sqlHelper = require('./sqlHelper')
const got = require('got');
const md5 = require('md5')
const fs = require('fs');
// var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

function loginFacebook(passport, io){
    

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    // used to deserialize the user
    passport.deserializeUser(function(user, done) {

        done(null, user);
    });
    
    passport.use(new FacebookStrategy({
        clientID: process.env.CLIENT_ID_FB,
        clientSecret: process.env.CLIENT_SECRET_FB,
        callbackURL: "http://localhost:8080/auth/facebook/login",
        profileFields: ['displayName','photos']
    },
        //store username=id nickname=displayName, avatar=photos.value, password=""
        async function(accessToken, refreshToken, profile, cb) {
            var user = {
                username: profile._json.id, 
                nickname: profile._json.name, 
                avatar: profile._json.picture.data.url
            }

            await sqlHelper.checkUserAndInsertLogin(user);

            return cb(false, user);
        }
    ));

    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID_GG,
        clientSecret: process.env.CLIENT_SECRET_GG,
        callbackURL: "http://localhost:8080/auth/google/login"
      },
    async function(accessToken, refreshToken, profile, done) {
        var user = {
            username: profile._json.sub,
            nickname: profile._json.name, 
            avatar: profile._json.picture,
            passport: '',
        }
        await sqlHelper.checkUserAndInsertLogin(user);
        return done(false, user)
}

    ));
    
}

module.exports = loginFacebook
