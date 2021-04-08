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
const db = require('./db/connect.db')
const functionClass = require('./public/js/function')

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
    
    socket.on('sender send message', ({sender, message, idroom})=>{ // {sender, message, idroom}
        //lấy socketId của thằng nhận
        var getReceiverSql = `
            select socketid 
            from users u1, 
                (select username from rooms where username!='${sender}' AND id=${idroom}) as u2
            where u1.username=u2.username  
        `        
        db.query(getReceiverSql, (err, result)=>{
            if (err) throw err

            //sau đó emit tới clinet để render ra html
            var socketIdReceiver = result[0].socketid
            io.in(socketIdReceiver).emit('server send message to receiver', {message, idroom, sender})

            //emit toi sender
            functionClass.getSocketid(sender).then((socketIdSender)=>{
                io.in(socketIdSender).emit('server send message to sender', {message, idroom, sender})
            })
            //sau do insert vao db
            var insertMessageSql = `insert into messages (idroom, sender, message) values (${idroom}, '${sender}', '${message}')`
            db.query(insertMessageSql, (err, result)=>{
                if (err) throw err
            })
        })
    })
});


http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
















