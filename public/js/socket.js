const sqlHelper = require('../../helpers/sqlHelper');
const functionHelper = require('../../helpers/functionHelper')
function socket(io){
    
    io.on('connection', (socket) => {
        //khi có user mới thì tạo room cho user đó bằn socket trong db
        socket.on('join socket id new user online', async (currentUser)=>{ //socketId
            socket.join(currentUser.socketid)
            socket.username = currentUser.username;

            var listRoomOnline = await functionHelper.filterAndGetRoomOnline(io.sockets.adapter.rooms, currentUser);
            io.emit('new user connect', listRoomOnline);
            
        })

        socket.on('disconnect', async ()=>{
            var listRoomOnline = await functionHelper.filterAndGetRoomOnline(io.sockets.adapter.rooms, {socketid: socket.id, username: socket.username});
            console.log("user disconnect", listRoomOnline);
            socket.broadcast.emit('user disconnect', listRoomOnline);
        })
        //lay message gan nhat trong room roi so sanh (updatedAt, currentDateTime. sender voi currentUser)
        //time line = updatedAt(DMY) == currentDateTime,
        //MessageNearest sua lai showDate khi message.sender==sender && timeLine== false
        
        socket.on('sender send message', async ({sender, message, idRoom})=>{ // {sender, message, idRoom}
            var usernames = await sqlHelper.getUserInRoom(idRoom)
            var messageNearest = await sqlHelper.getMessageNearest(idRoom);
            var date = new Date();
            var isTimeLine = functionHelper.compareDate(date, messageNearest.updatedAt) === true ? 0 : 1
            var isShowTime = (sender == messageNearest.sender && isTimeLine == false);

            usernames.forEach((user)=>{
                sqlHelper.emit(user, 'server send message', {message, idRoom, sender}, io)
            })
            if (isShowTime){
                sqlHelper.setIsShowTimeByMessageId(messageNearest.id);
            }
            
            sqlHelper.insertMessage(sender, idRoom, message, isTimeLine);
            
        })
    });
}

module.exports = socket;