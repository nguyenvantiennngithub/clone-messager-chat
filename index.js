const express = require('express')
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const connect = require('./db/index.db')
const router = require('./mvc/router/index.router');
const api = require('./api/router/api.router')
const middleware = require('./middleware/index.middleware')
const db = require('./db/connect.db')
const sqlHelper = require('./helpers/sqlHelper')
const socket = require('./public/js/socket')
const port = process.env.PORT || 8080

app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.set('views', './mvc/views')
app.set('socketio', io) //export socket io to a global

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
//run cpanel
// var options = {
//     host: 'localhost',
//     port: 3306,
//     user: 'nveysqehosting_vantiennn',
//     password: '1Ew^^)D_B7_g',
//     database: 'nveysqehosting_messager'
// };
var sessionStore = new MySQLStore(options);
var sess = {
    secret: 'this is secret',
	store: sessionStore,
	resave: false,
    saveUninitialized: false,
    
    cookie:{
        maxAge: 1000 * 60 * 60 * 48,
        // secure: process.env.NODE_ENV == "production" ? true : false ,
        // maxAge: 1000*60*60*24, //1 ngày
    },
}
app.use(session(sess));

socket(io)
connect()
api(app)
router(app)



http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
















