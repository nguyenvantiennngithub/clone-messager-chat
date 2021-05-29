const sqlHelper = require('../../helpers/sqlHelper');
function socket(io){
    
    io.on('connection', (socket) => {
        //khi có user mới thì tạo room cho user đó bằn socket trong db
        socket.on('join socket id new user online', async (currentUser)=>{ //socketId
            socket.join(currentUser.socketid)
            socket.username = currentUser.username;

            var listRoomOnline = await sqlHelper.filterAndGetRoomOnline(io.sockets.adapter.rooms, currentUser);
            io.emit('new user connect', listRoomOnline);
            
        })

        socket.on('disconnect', async ()=>{
            var listRoomOnline = await sqlHelper.filterAndGetRoomOnline(io.sockets.adapter.rooms, {socketid: socket.id, username: socket.username});
            console.log("user disconnect", listRoomOnline);
            socket.broadcast.emit('user disconnect', listRoomOnline);
        })
        
        socket.on('sender send message', async ({sender, message, idRoom})=>{ // {sender, message, idRoom}
            // var is_personal = await sqlHelper.getIsPersonal(sender, idRoom)
            // console.log('index/senderSendMessage', {sender, message, idRoom})
            var usernames = await sqlHelper.getUserInRoom(idRoom)
            usernames.forEach((user)=>{
                sqlHelper.emit(user, 'server send message', {message, idRoom, sender}, io)
            })

            sqlHelper.insertMessage(sender, idRoom, message)
            
        })
    });
}

module.exports = socket;