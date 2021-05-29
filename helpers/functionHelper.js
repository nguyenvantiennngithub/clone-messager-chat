const sqlHelper = require('./sqlHelper');
class functionHelper{
    async filterListSocketIdRough(listSocketIdRough){
        var listUser = [];
        for (const socketId of listSocketIdRough){
            var user = await sqlHelper.getInfoBySocketId(socketId[0])
            if (user){
                listUser.push(user.socketid)
            }
        }
        return listUser;
    }

    async filterAndGetRoomOnline(listSocketIdRough, currentUser){
        var listSocketId = await this.filterListSocketIdRough(listSocketIdRough);
        console.log('function/filterAndGetRoomOnline', listSocketId)
        var result = await sqlHelper.getRoomOnlineBySocket(listSocketId, currentUser);
        result = result.map((room)=>{
            return room.id;
        })
        return result;
    }
}