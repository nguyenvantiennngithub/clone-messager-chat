
const db = require('../../db/connect.db')
const sqlHelper = require('../../helpers/sqlHelper');
const functionHelper = require('../../helpers/functionHelper');
const client = require('../../db/connect.redis')
const util = require('util');
client.get = util.promisify(client.get);
class apiController{
    //[GET] /api/users
    //lấy tất cả user
    async totalUser(req, res, next){
        var totalUserCache = await client.get('total-user');
        console.log("apiController/totalUser", totalUserCache);
        if (totalUserCache != null){
            res.json(JSON.parse(totalUserCache));
            return;
        }
        var sql = `select nickname, username, avatar from users`
        db.query(sql, (err, result)=>{
            if (err) throw err
            client.set('total-user', JSON.stringify(result));
            res.json(result)
        })
    }
    //[GET] /api/groups
    //lấy tất cả group của curentUser
    async totalGroup(req, res, next){
        const username = res.locals.username
        var getGroupSql = `select * from rooms where username='${username}' AND isPersonal=0`
        db.query(getGroupSql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }

    //[GET] /api/users
    //lấy current user
    async currentUser(req, res, next){
        const username = res.locals.username
        const socketid = req.session.id
      
        var currentUserCache = await client.get(`current-user[${username}]`);
        if (currentUserCache){
            res.json(JSON.parse(currentUserCache));
            return;
        }
        var currentUserAPI = await sqlHelper.getCurrentUser(username);
        client.set(`current-user[${username}]`, JSON.stringify(currentUserAPI), 'EX', 60*60*24);

        res.json(currentUserAPI);
    }

    async userByUsername(req, res, next){
        const username = req.params.username;
        var result = await sqlHelper.getInfoUser(username)
        res.json(result)
    }

    //[GET] /api/user-chat-list
    //lấy user được add
    async checkedUser(req, res, next){
        const currentUser = res.locals.username
        var checkedUserCache = await client.get(`checked-user[${currentUser}]`);
        if (checkedUserCache != null){
            res.json(JSON.parse(checkedUserCache))
            return;
        }
        //sql này dùng dể lấy những username có cùng rooms với currentUser và ko lấy currentUser     
        var getUserInRoomsSql = `
            select receiver.id, receiver.username, r.updatedAt, user.nickname, r.isPersonal, receiver.name, user.avatar, r.countUnRead, receiver.nickname as nicknameRoom
            from rooms r, (
                select * from rooms 
                where id in (select id from rooms where username='${currentUser}' AND isShow=1) AND username != '${currentUser}')
                as receiver, users user
            where r.id=receiver.id AND r.username='${currentUser}' AND user.username= receiver.username AND r.isPersonal = 1
        `

        db.query(getUserInRoomsSql, (err, result)=>{
            if (err) throw err
            client.set(`checked-user[${currentUser}]`, JSON.stringify(result));
            res.json(result)
        })
    }

    //lấy group được add
    //[GET] /api/group-chat-list
    checkedGroup(req, res){
        const currentUser = res.locals.username;
        var getGroupSql = `
            select name, updatedAt, id, isPersonal, avatar, countUnRead 
            from rooms where username='${currentUser}' AND isShow=1 AND isPersonal=0 
        `
        db.query(getGroupSql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }

    
    //[GET] /api/message
    message(req, res, next){
        const idRoom = req.params.id
        const page = req.params.page
        const currentUser = res.locals.username
        var getMessageSql = `
            select mess.id as idAT, currentUserRoom.id, mess.sender, mess.updatedAt, mess.message, mess.isShowTime, mess.isTimeLine, senderRoom.nickname
            from messages mess, rooms currentUserRoom , rooms senderRoom
            where mess.idRoom='${idRoom}' AND 
                currentUserRoom.username='${currentUser}' AND
                mess.idRoom=currentUserRoom.id AND
                senderRoom.id=currentUserRoom.id AND
                senderRoom.username=mess.sender
                order by mess.updatedAt DESC LIMIT 20 OFFSET ${(page-1)*20} 
        `
        db.query(getMessageSql, (err, result)=>{
            if (err) throw err
            console.log(result)
            res.json(result)
        })
    }

    totalGroupByUsername(req, res, next){
        const {receiver} = req.params
        var getRoomSql = `select id from rooms where username='${receiver}' AND isPersonal=0`
        db.query(getRoomSql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }

    messageOldest(req, res){
        const idRoom = req.params.idroom;
        var sql = ` select *
                    from messages 
                    where idRoom='${idRoom}' 
                    order by updatedAt asc`
        db.query(sql, (err, result)=>{
            if (err) throw err
            res.json(result[0]);
        })
    }
    getMessageAtIndex(req, res){
        const idRoom = req.params.idroom;
        const index = req.params.index
        var sql = ` select *
                    from messages 
                    where idRoom='${idRoom}' 
                    order by updatedAt DESC`
        db.query(sql, (err, result)=>{
            if (err) throw err
            res.json(result[index]);
        })
    }
    getLengthGroupByIdRoom(req, res, next){
        const idRoom = req.params.id;
        console.log('getLengthGroupByIdRoom', idRoom)
        if (idRoom === 'undefined'){
            res.json(0);
            return;
        }
       
        var getLengthGroup = `select count(*) as length from rooms where id=${idRoom}`
        db.query(getLengthGroup, (err, result)=>{
            if (err) throw err
            res.json(result[0].length)
        })
    }

   
    userInRoom(req, res){
        const currentUser = res.locals.username;
        const idRoom = req.params.id;
        console.log("userInRoom", idRoom)
        var getUserInRoomsSql = `
            select user.username, user.nickname, room.isHost, user.avatar from rooms room, users user
            where room.username=user.username AND room.id=${idRoom}
        `
        db.query(getUserInRoomsSql, (err, result)=>{
            if (err) throw err;
            return res.json(result);
        })
    }

    groupCurrentUserByIdRoom(req, res, next){
        const currentUser = res.locals.username;
        const idRoom = req.params.id;
        // console.log('groupCurrentUserByIdRoom', {currentUser, idRoom})
        var getInfoRoom = `select distinct username, id, name, isPersonal, avatar, nickname from rooms where id=${idRoom} AND username!='${currentUser}'`
        db.query(getInfoRoom,async (err, result)=>{
            if (err) throw err
            // console.log('groupCurrentUserByIdRoom', result);
            if (result.length != 0){
                if (result[0].isPersonal){
                    var infoUser = await sqlHelper.getInfoUser(result[0].username);
                    result[0].avatar = infoUser.avatar
                }
            }

            
            res.json(result[0]);
        })
    }

    hostUserInRoom(req, res){
        var id = req.params.id;
        var getUserHostSql = `select username from rooms where id=${id} AND isHost=1`
        db.query(getUserHostSql, (err, result)=>{
            if (err) throw err;
            res.json(result[0]);
        })
    }

    async idRoomOnline(req, res){
        const io = req.app.get('socketio');
        const currentUser = await sqlHelper.getInfoUser(res.locals.username)
        var roomOnline = await functionHelper.filterAndGetRoomOnline(io.sockets.adapter.rooms, currentUser);
        res.json(roomOnline);

    }

    async getUserInRoomByUsernameIdRoom(req, res){
        const {username, id} = req.params;
        const isHost = await sqlHelper.getUserInRoomByUsernameIdRoom(username, id);
        res.json(isHost);
    }
    async idRoomNearest(req, res){
        const currentUser = res.locals.username;
        const result = await sqlHelper.getIdRoomNearest(currentUser);
        res.json(result);
    }


}

module.exports = new apiController()
