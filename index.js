const express = require('express')
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express()
const port = 8080
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser')
const connect = require('./db/index.db')
const router = require('./mvc/router/index.router');
const api = require('./api/router/api.router')
const middleware = require('./middleware/index.middleware')
app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.set('views', './mvc/views')
app.set('socketio', io) //export socket io to a global

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'messagers'
};

var sessionStore = new MySQLStore(options);

app.use(session({
	secret: 'this is secret',
	store: sessionStore,
	resave: false,
    saveUninitialized: false,
    
    cookie:{
        maxAge: 1000*60*60*24, //1 ngày
    }
}));

connect()
api(app)
router(app)

// console.log("outtt", io.sockets.adapter.rooms)

io.on('connection', (socket) => {
    socket.on('change socket', (socketid)=>{ //socketid
        socket.join(socketid)
        io.emit('changed')
    })
    socket.on('disconnect', ()=>{
    })
    
});



http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


/*
    "axios": "^0.21.1",
    "bcrypt": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.19.0",
    "ejs": "^3.1.5",
    "express": "^4.17.1",
    "express-mysql-session": "^2.1.5",
    "express-session": "^1.17.1",
    "mysql": "^2.18.1",
    "nodemon": "^2.0.7",
    "socket.io": "^3.1.0",
    "sql": "^0.78.0"
*/