const db = require('../db/connect.db')
const bcrypt = require('bcryptjs')

class functionClass{
    //ham nay nhan vao 1 cai username 
    async getSocketId(username){
        return new Promise((res, rej)=>{
            //tim trong db lay ra cai usrename do roi resolve
            var sqlGetSocketid = `select socketid from users where username='${username}'`
            db.query(sqlGetSocketid, (err, result)=>{
                if (err) throw err
                res(result[0].socketid)
            })
        })
    }
    
    async getInfoGroupByUsernameIdRoom(username, idRoom){
        // console.log("function/getGroupName", {username, idRoom})
        return new Promise((res, rej)=>{
            //tim trong db lay ra cai usrename do roi resolve
            var sqlGetGroupName = `select name, avatar from rooms where username='${username}' AND id=${idRoom}`
            db.query(sqlGetGroupName, (err, result)=>{
                if (err) throw err
                res(result[0])
            })
        })
    }

    //hàm lấy ra idRoom lớn nhất trong db
    async getMaxIdRoom(){
        //promise này để lấy ra cái idRoom cao nhất
        //để mà nếu có insert thì cộng nó lên 1 để insert
        return new Promise((resolve, reject)=>{
            var getIdSql = `select max(id) as 'maxId' from rooms `
            db.query(getIdSql, function (err, result){
                if (err) return reject(err);
                resolve(result[0].maxId)
                // console.log("Function/getMaxIdRoom", result[0].maxId);

            })
        })
        
    }

    //hàm kiểm tra xem 2 người này đã có room với nhau chưa
    //hàm lấy id rôom
    async getIdRoom(sender, receiver){
        return new Promise(
            function (resolve, reject){
                var getReceiverSql = `
                select username, id from rooms 
                where username='${receiver}' AND isPersonal=1 AND id in (select id from rooms where username='${sender}' AND isPersonal=1)`
                db.query(getReceiverSql, (err, result)=>{
                    if (err) return reject(err);
                    // console.log("function/getIdRoom",result)
                    if (result.length > 0){
                        resolve(result[0].id);
                    }else{
                        resolve(0);
                    }
                })
            }
        )
    }
    getIdRoomNearest(username){
        return new Promise(
            function (resolve, reject){
                
                var getRoomSql = `
                    select id
                    from rooms 
                    where username='${username}' AND isShow=1
                    order by updatedAt desc
                `
                db.query(getRoomSql, (err, result)=>{
                    if (err) return reject(err)
                    // console.log('getIdRoomNearest', result)
                    if (result.length > 0){
                        resolve(result[0].id);
                    }
                    resolve(0)
                })
            }
        )
    }

    getInfoUser(username){
        return new Promise(
            function(resolve, reject){
                var getInfoSql = `select nickname, username, socketid, avatar from users where username='${username}'`
                return db.query(getInfoSql, (err, result)=>{
                    if (err) return reject(err)
                    return resolve(result[0])
                })
            }
        )
        
    }

    getUserInRoom(idRoom){
        return new Promise(
            function(resolve, reject){
                var getIdInRoom = `select username from rooms where id=${idRoom}`
                db.query(getIdInRoom, (err, result)=>{
                    if (err) return reject(err)
                    result = result.map((item)=>{
                        return item.username
                    })
                    resolve(result)
                })
            }
        )
    }

    getIsPersonal(username, idRoom){
        console.log('function/GetIsPersonal', {username, idRoom})
        return new Promise(
            function (resolve, reject){
                var getUserInRoom = `select * from rooms where username='${username}' AND id=${idRoom}`
                db.query(getUserInRoom, (err, result)=>{
                    if (err) return reject(err) 
                    resolve(result[0].isPersonal)
                })
            }
        )

    }

    getInfoBySocketId(socketId){
        return new Promise(
            function (resolve, reject){
                // console.log("function/getInfoBySocketId", socketId);
                var sql = `select username, nickname, socketid from users
                    where socketid='${socketId}'`
                db.query(sql, (err, result)=>{
                    if (err) return reject(err)
                    resolve(result[0]);
                })
            }
        )
    }

    getRoomOnlineBySocket(sockets, currentUser){
        return new Promise(
            function (res, rej){
                sockets = sockets.filter((socket)=>{
                    return socket != currentUser.socketid;
                })
                var joinSockets = sockets.join(', ');
                var sql = `select user.id 
                    from rooms user, rooms roomReceiver, users receiver
                    where user.username='${currentUser.username}' AND user.id=roomReceiver.id AND 
                        receiver.username = roomReceiver.username AND receiver.socketid in ('${joinSockets}')
                    `
                db.query(sql, (err, result)=>{
                    if (err) return rej(err);
                    res(result);
                })
            }
        )
    }

    getIsHost(username, idRoom){
        return new Promise(
            function (res, rej){
                var sql = `select isHost as isHost from rooms
                where username='${username}' AND id=${idRoom}`
                db.query(sql, (err, result)=>{
                    if (err) rej(err);
                    res(result[0].isHost);
                })
            })
    }

    setUpdatedAt(username, idRoom){
        //và update lại cái isShow cho nó bằng 1 là hiển thị
        var updateUpdatedAtSql = `update rooms 
            set isShow=1, updatedAt=CURRENT_TIMESTAMP() 
            where username='${username}' AND id=${idRoom}
        `
        db.query(updateUpdatedAtSql, (err, result) => {
            if (err) throw err
        })
    }

    setIsShow(username, idRoom){
        var updateUpdatedAtSql = `update rooms 
            set isShow=0
            where username='${username}' AND id=${idRoom}
        `
        db.query(updateUpdatedAtSql, (err, result) => {
            if (err) throw err
        })
    }
    
    setIsHost(username, idRoom, isHost){
        var sql = `update rooms
            set isHost=${isHost}
            where username='${username}' AND id=${idRoom}`
        db.query(sql, (err, result)=>{
            if (err) throw err;
        })
    }

    insertAddChatListPersonal(username, idRoom, isShow, nicknameReceiver){
        var insertRoomsSql = `insert into rooms (id, username, isShow, nickname) 
            values (${idRoom}, '${username}', ${isShow}, '${nicknameReceiver}')`
        db.query(insertRoomsSql, (err, result) => {
            if (err) throw err
        })
    }

    insertAddChatListGroup(username, idRoom, isShow, name, isHost, avatar){
        var createGroupSenderSql = `insert into rooms (username, isShow, id, isPersonal, name, isHost, avatar) 
            values ('${username}', ${isShow}, ${idRoom}, 0, '${name}', ${isHost}, '${avatar}')`
        db.query(createGroupSenderSql, (err, result)=>{
            if (err) throw err
        })
    }

    insertMessage(sender, idRoom, message){
        var insertMessageSql = `insert into messages (idroom, sender, message) values (${idRoom }, '${sender}', '${message}')`
        db.query(insertMessageSql, (err, result)=>{
            if (err) throw err
        })
    }

    insertUser(username, nickname, hashPsw, socketid, avatar){
        var sql = `insert into users (nickname, username, password, socketid, avatar) values ('${nickname}', '${username}', '${hashPsw}', '${socketid}', '${avatar}')`
        db.query(sql, (err, result)=>{
            if (err) throw err;
        })
    }

    async emit(username, event, data, io){
        var sqlGetSocketid = `select socketid from users where username='${username}'`
        db.query(sqlGetSocketid, (err, result)=>{
            if (err) throw err
            // console.log('function/emit', result)
            var socketId = result[0].socketid;
            console.log("sqlHelper/emit", data)
            io.in(socketId).emit(event, data)
        })
    }

    checkUser(username, password){
        return new Promise(
            function (resolve, reject){
                var sql = `select password, socketid from users where username='${username}'`
                db.query(sql, (err, result)=>{
                    if (err) return reject(err) 
                    if (result.length == 1){
                        var isMatch = bcrypt.compareSync(password, result[0].password)
                        if (isMatch){
                            resolve(true);
                        }else{
                            resolve(false);
                        }
                    }
                    resolve(false);
                })
            }
        )
    }

    isExistsUser(username){
        return new Promise(
            function (resolve, reject){
                var sql = `select username from users where username='${username}'`
                db.query(sql, (err, result)=>{
                    if (err) return reject(err) 
                    if (result.length == 1){
                        return resolve(true);
                    }
                    return resolve(false);
                })
            }
        )
    } 

    
}


module.exports = new functionClass()