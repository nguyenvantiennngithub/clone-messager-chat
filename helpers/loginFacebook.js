const express = require('express')
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const db = require('../db/connect.db')
const sqlHelper = require('./sqlHelper')
// var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;

function loginFacebook(passport, io){
    

    passport.serializeUser(function(user, done) {
        console.log('user',user)
        done(null, user);
    });
    
    // used to deserialize the user
    passport.deserializeUser(function(user, done) {

        // var sql = `select username, nickname, avatar from users where username='${id.id}'`
        // db.query(sql, function(err,result){	

            // console.log(result[0])
            done(null, user);
        // });
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
            var result = await sqlHelper.checkIsExistsUserByUsername(user.username);
            if (result.length == 0){
                sqlHelper.insertUser(user.username, user.nickname, '', user.avatar);
            }

            return cb(false, user);
        }
    ));


    
    
}

module.exports = loginFacebook
