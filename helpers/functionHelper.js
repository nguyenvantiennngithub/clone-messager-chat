const sqlHelper = require('./sqlHelper');
class functionHelper{
    async filterListRoomRough(listRoomRough){
        var listUser = [];//room is Username
        for (const room of listRoomRough){
            var user = await sqlHelper.getInfoUserByUsername(room[0])
            if (user){
                listUser.push(user.username)
            }
        }
        return listUser;
    }

    async filterAndGetRoomOnline(listRoomRough, currentUser){
        //Username represent room
        var listRoomOnline = await this.filterListRoomRough(listRoomRough);
        console.log('function/filterAndGetRoomOnline', listRoomOnline)
        var result = await sqlHelper.getRoomOnlineBySocket(listRoomOnline, currentUser);
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
