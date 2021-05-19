const express = require('express')
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express()
const port = process.env.PORT || 8080
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser')
const connect = require('./db/index.db')
const router = require('./mvc/router/index.router');
const api = require('./api/router/api.router')
const middleware = require('./middleware/index.middleware')
const db = require('./db/connect.db')
const functionClass = require('./public/js/function')

app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.set('views', './mvc/views')
app.set('socketio', io) //export socket io to a global

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// run local
var options = {
	host: process.env.HOST || 'localhost',
	port: process.env.PORT ||3306,
	user: process.env.USER ||'root',
	password: process.env.PASSWORD ||'',
	database: process.env.DATABASE ||'messagers'
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
app.set('trustproxy', true)
app.use(session({
	secret: 'this is secrdsadsaet',
	store: sessionStore,
	resave: false,
    saveUninitialized: false,
    
    cookie:{
        secure: process.env.NODE_ENV == "production" ? true : false ,
        maxAge: 1000*60*60*24, //1 ngày
    }
}));
app.use('/test', function(req, res){
    res.redirect("/")
})
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
    
    socket.on('sender send message', async ({sender, message, idRoom})=>{ // {sender, message, idRoom}
        // var is_personal = await functionClass.getIsPersonal(sender, idRoom)
        console.log('index/senderSendMessage', {sender, message, idRoom})
        var usernames = await functionClass.getUserInRoom(idRoom)
        usernames.forEach((user)=>{
            functionClass.emit(user, 'server send message', {message, idRoom, sender}, io)
        })

        functionClass.insertMessage(sender, idRoom, message)
        
    })
});


http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
















