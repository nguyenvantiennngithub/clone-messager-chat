const express = require('express')
const expressSession = require('express-session')
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express()
const port = 8080
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser')
const connect = require('./db/index.db')
const router = require('./mvc/router/index.router');
const api = require('./mvc/router/api.router')
app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.set('views', './mvc/views')


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'messager'
};

var sessionStore = new MySQLStore(options);

app.use(session({
	secret: 'this is secret',
	store: sessionStore,
	resave: false,
    saveUninitialized: false,
    
    cookie:{
        maxAge: 1000*60*60*24 //1 ngày
    }
}));

connect()
app.use(api)
router(app)


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});



http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})