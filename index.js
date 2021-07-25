require('dotenv').config()

const express = require('express')
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const fileupload = require('express-fileupload')
const connect = require('./db/index.db')
const router = require('./mvc/router/index.router');
const api = require('./api/router/api.router')
const socket = require('./public/js/socket')
const port = process.env.PORT || 8080
const passport = require('passport')
const login = require('./helpers/login')

app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.set('views', './mvc/views')
app.set('socketio', io) //export socket io to a global
app.use(fileupload())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

// run local
var options = {
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 3306,
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD ||'',
	database: process.env.DB_DATABASE ||'messagers'
};
var sessionStore = new MySQLStore(options);
var sess = {
    secret: process.env.SESSION_SECRET,
	store: sessionStore,
	resave: false,
    saveUninitialized: false,
    
    cookie:{
        maxAge: 1000 * 60 * 60 * 24,
    },
}

app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());



login(passport, io);
socket(io)
connect()
api(app)
router(app)



http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
















