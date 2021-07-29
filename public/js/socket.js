const sqlHelper = require('../../helpers/sqlHelper');
const functionHelper = require('../../helpers/functionHelper')
var peers = {}
function socket(io){
    
    io.on('connection', (socket) => {

        //khi có user mới thì tạo room cho user đó bằn socket trong db
        socket.on('join socket id new user online', async (currentUser)=>{ //socketId
            console.log("currentUser", currentUser)
            await socket.join(currentUser.username)
            socket.username = currentUser.username;
            var listRoomOnline = await functionHelper.filterAndGetRoomOnline(io.sockets.adapter.rooms, currentUser);
            sqlHelper.emit(currentUser.username, 'everything ok', '', io);
            io.emit('new user connect', listRoomOnline);
        })

        socket.on('disconnect', async ()=>{
            var listRoomOnline = await functionHelper.filterAndGetRoomOnline(io.sockets.adapter.rooms, {username: socket.username});
            socket.broadcast.emit('user disconnect', listRoomOnline);
            
            //handle video call when user leave room
            console.log("disconnect", socket.idRoom, socket.peerId)
            socket.to(socket.idRoom).broadcast.emit('someone left room', socket.peerId);
            delete peers[socket.peerId]
        })
        
        socket.on('sender send message', async ({sender, message, idRoom})=>{ // {sender, message, idRoom}
            var isShowTimeMessageNearest = false;//thoi gian duoi message cua message gan nhat trong room
            var usersInGroup = await sqlHelper.getUserInRoom(idRoom)
            var messageNearest = await sqlHelper.getMessageNearest(idRoom);
            var isTimeLine = 1;//time line truoc block message, 1 is true in sql
            
            var date = new Date();

            

            if (messageNearest){
                isTimeLine = functionHelper.compareDate(date, messageNearest.updatedAt) === true ? 0 : 1
                isShowTimeMessageNearest = (sender == messageNearest.sender && isTimeLine == false);
            }
            if (isShowTimeMessageNearest){
                sqlHelper.setIsShowTimeByMessageId(messageNearest.id);
            }
            sqlHelper.insertMessage(sender, idRoom, message, isTimeLine);
           
            usersInGroup.forEach((user)=>{
                sqlHelper.setUnRead({idRoom, username: user, isIncrease: true});
                sqlHelper.emit(user, 'server send message', {message, idRoom, sender}, io)
            })
            

            
        })


        socket.on('client request video call', async function(data){
            var usersInGroup = await sqlHelper.getUserInRoom(data.idRoom);

            usersInGroup = usersInGroup.filter(user=>{
                return user !== data.currentUser;
            })
            usersInGroup.forEach((user)=>{
                sqlHelper.emit(user, 'server request video call', data, io)
            })
        })

        socket.on('set unread field', function(data){
            console.log(data)
            sqlHelper.setUnRead(data);
        })

        socket.on('sender send video call', async function({sender, idRoom}){
            var usersInGroup = await sqlHelper.getUserInRoom(idRoom)
            usersInGroup.forEach((user)=>{
                if (user !== sender){
                    sqlHelper.emit(user, 'server send video call', {sender, idRoom}, io);
                }
            })
        })

        socket.on('new user connect room', async function({idRoom, user}){
            console.log("new user connect room", user)
            socket.join(idRoom);
            socket.idRoom = idRoom;
            socket.peerId = user.peerId
            peers[user.peerId] = user;
            socket.emit('hello new user', peers);
            socket.to(idRoom).broadcast.emit('user connected', {user});
            console.log(io.sockets.adapter.rooms)
        })

        socket.on('client request room is calling', function({sender, idRoom}){
            var socketIdInRoom = io.sockets.adapter.rooms;
            var isCalling = socketIdInRoom.has(idRoom.toString())
            sqlHelper.emit(sender, 'server respose room is calling', isCalling, io);
        })
    });
}

module.exports = socket;