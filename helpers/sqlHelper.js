const cloudinary = require('cloudinary').v2
const db = require('../db/connect.db')
const bcrypt = require('bcryptjs')
const got = require('got')
const md5 = require('md5')
const fs = require('fs')


const client = require('../db/connect.redis');
class functionClass{
    //ham nay nhan vao 1 cai username 
    // async getSocketId(username){
    //     return new Promise((res, rej)=>{
    //         //tim trong db lay ra cai usrename do roi resolve
    //         var sqlGetSocketid = `select socketid from users where username='${username}'`
    //         db.query(sqlGetSocketid, (err, result)=>{
    //             if (err) throw err
    //             res(result[0].socketid)
    //         })
    //     })
    // }
    
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
                if (result.length == 0){
                    return resolve(0);
                }
                return resolve(result[0].maxId)
                // console.log("Function/getMaxIdRoom", result[0].maxId);

            })
        })
    }

    async getMessageNearest(idRoom){
        return new Promise((res, rej)=>{
            var sql = `select * from messages where idRoom=${idRoom} order by updatedAt DESC`
            db.query(sql, (err, result)=>{
                if (err) rej(err);
                // console.log(result)
                res(result[0])
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
                        // console.log(result);
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
                var getInfoSql = `select nickname, username, avatar from users where username='${username}'`
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

    getInfoUserByUsername(username){
        return new Promise(
            function (resolve, reject){
                var sql = `select nickname, username, avatar from users
                    where username='${username}'`
                db.query(sql, (err, result)=>{
                    if (err) return reject(err)
                    resolve(result[0]);
                })
            }
        )
    }
    getInfoSenderInRoom(sender, idRoom){
        return new Promise(
            function (resolve, reject){
                var sql = `select nickname, countUnRead from rooms where username='${sender}' AND id=${idRoom}`
                db.query(sql, (err, result)=>{
                    if (err) return reject(err)
                    resolve(result[0]);
                })
            }
        )
    }
    //rooms is username beacause username create room name
    getRoomOnlineBySocket(rooms, currentUser){
        return new Promise(
            function (res, rej){
                rooms = rooms.filter((room)=>{
                    return room != currentUser.username;
                })
                //format SQL
                var joinRooms = rooms.join(', ');
                var sql = `
                    select * 
                    from users receiver, rooms receiverRoom, rooms currentUserRoom
                    where currentUserRoom.username='${currentUser.username}' AND 
                        currentUserRoom.id=receiverRoom.id AND
                        receiverRoom.username=receiver.username AND
                        receiver.username in ('${joinRooms}')
                `
                db.query(sql, (err, result)=>{
                    if (err) return rej(err);
                    res(result);
                })
            }
        )
    }

    getUserInRoomByUsernameIdRoom(username, idRoom){
        return new Promise(
            function (res, rej){
                var sql = `select isHost, nickname, countUnRead from rooms
                where username='${username}' AND id=${idRoom}`
                db.query(sql, (err, result)=>{
                    if (err) rej(err);
                    res(result[0]);
                })
            })
    }

    getCurrentUserAndCache(username){
        console.log("getCurrentUserAndCache")
        return new Promise(
            function (res, rej){
                var sql = `select nickname, username, avatar from users u where u.username='${username}'`
                db.query(sql, (err, result)=>{
                    if (err) rej(err)
                    console.log("result", result)
                    client.set(`currentUser[${username}]`, JSON.stringify(result), 'EX', 360);
                    return res(result);
                })
            })
    }

    

    setUpdatedAt(username, idRoom, isShow){
        //và update lại cái isShow cho nó bằng 1 là hiển thị
        var updateUpdatedAtSql = `update rooms 
            set isShow=${isShow}, updatedAt=CURRENT_TIMESTAMP() 
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
    
    setIsShowTimeByMessageId(id){
        var sql = `update messages set isShowTime=0 where id=${id}`
        db.query(sql, (err, result)=>{
            if (err) throw err;
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

    setUnRead({idRoom, username, isIncrease}){
        if (isIncrease){
            var sql = `
            update rooms 
            set countUnRead=countUnRead+1
            where id='${idRoom}' AND username='${username}'
            `    
        }else{
            var sql = `
            update rooms 
            set countUnRead=0
            where id='${idRoom}' AND username='${username}'
            `
        }
        
        db.query(sql, (err, result)=>{
            if (err) throw err;
        })
    }

    insertAddChatListPersonal(username, idRoom, isShow, nicknameReceiver){
        return new Promise(
            function (res, rej){
                var insertRoomsSql = `insert into rooms (id, username, isShow, nickname) 
                    values (${idRoom}, '${username}', ${isShow}, '${nicknameReceiver}')`
                db.query(insertRoomsSql, (err, result) => {
                    if (err) rej(err)
                    return res(true);
                })
            })
        
    }

    insertAddChatListGroup(username, idRoom, isShow, name, isHost, avatar){
        var createGroupSenderSql = `insert into rooms (username, isShow, id, isPersonal, name, isHost, avatar) 
            values ('${username}', ${isShow}, ${idRoom}, 0, '${name}', ${isHost}, '${avatar}')`
        db.query(createGroupSenderSql, (err, result)=>{
            if (err) throw err
        })
    }

    insertMessage(sender, idRoom, message, isTimeLine){
        var insertMessageSql = `insert into messages (idroom, sender, message, isTimeLine, isShowTime) values (${idRoom }, '${sender}', '${message}', '${isTimeLine}', 1)`
        db.query(insertMessageSql, (err, result)=>{
            if (err) throw err
        })
    }

    insertUser(username, nickname, hashPsw = '', avatar){
        console.log("INSERT USER", {username, nickname, hashPsw, avatar});
        var sql = `insert into users (nickname, username, password, avatar) values ('${nickname}', '${username}', '${hashPsw}', '${avatar}')`
        db.query(sql, (err, result)=>{
            if (err) throw err;
        })
    }

    async emit(username, event, data, io){
        io.in(username.toString()).emit(event, data)
    }
    
    async checkUserAndInsertLogin(user){
        var respose = await got(user.avatar, { responseType: 'buffer' });
        var result;
        var index = respose.url.indexOf('&height')
        var url = respose.url.slice(0, index)
        console.log(url)
        var md5Code = md5(url);
       
        result = await this.checkIsExistsUserByUsername(user.username);

        if (result.length == 0){
            var url = this.uploadImage(md5Code, respose.buffer, respose.requestUrl)
            this.insertUser(user.username, user.nickname, '', url.urlStoreAtDB, md5Code);
        }
    }

    uploadImage(md5, buffer, urlFileImage, avatar){
        var urlStoreAtServer = 'public/uploads/' + md5;
        var urlStoreAtDB = process.env.IS_LOCAL == 'TRUE' ? '/uploads/' : 'https://res.cloudinary.com/vantiennn/image/upload/v1627528384/uploads/' 
        console.log(process.env.IS_LOCAL)
        if (process.env.IS_LOCAL == 'TRUE'){
            if (buffer){
                fs.writeFile(urlStoreAtServer, respose.buffer, function(err){
                    if (err) throw err
                });
            }else{
                avatar.mv(urlStoreAtServer, function(err){
                    if (err) throw err
                })
            }
        }else{
            cloudinary.uploader.upload(urlFileImage, {public_id: 'uploads/' + md5},function(err, result){
                if (err) throw err
            })
        }
        return {urlStoreAtServer, urlStoreAtDB};
    }

    checkIsExistsUserByUsername(username){
        return new Promise(
            function (resolve, reject){
                var sql = `select password from users where username='${username}'`
                db.query(sql, (err, result)=>{
                    if (err) return reject(err) 
                    resolve(result);
                })
            }
        )
    }

    checkUser(username, password){
        return new Promise(
            function (resolve, reject){
                var sql = `select password from users where username='${username}'`
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