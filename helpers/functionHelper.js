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
    
    compareDate(date1, date2){
        if (typeof(date1) == 'string') date1 = new Date(date1);
        if (typeof(date2) == 'string') date2 = new Date(date2);
        if (date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()){
            return true;
        }   
        return false;
    }
}

module.exports = new functionHelper();
