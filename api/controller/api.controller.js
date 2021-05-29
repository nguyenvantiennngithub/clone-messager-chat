
const db = require('../../db/connect.db')
const sqlHelper = require('../../helpers/sqlHelper');
class apiController{
    //[GET] /api/users
    //lấy tất cả user
    async totalUser(req, res, next){
        var sql = `select nickname, username, socketid from users`
        await db.query(sql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }
    //[GET] /api/groups
    //lấy tất cả group của curentUser
    async totalGroup(req, res, next){
        const username = res.locals.username
        var getGroupSql = `select * from rooms where username='${username}' AND is_personal=0`
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
        var sql = `select nickname, username, socketid from users u, sessions s where s.session_id='${socketid}' AND u.username='${username}'`
        db.query(sql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }

    //[GET] /api/user-chat-list
    //lấy user được add
    checkedUser(req, res, next){
        const currentUser = res.locals.username
        
        //sql này dùng dể lấy những username có cùng rooms với currentUser và ko lấy currentUser     
        var getUserInRoomsSql = `
            select receiver.id, receiver.username, r.updatedAt, user.nickname, r.is_personal, receiver.name
            from rooms r, (
                select * from rooms 
                where id in (select id from rooms where username='${currentUser}' AND is_show=1) AND username != '${currentUser}')
                as receiver, users user
            where r.id=receiver.id AND r.username='${currentUser}' AND user.username= receiver.username AND r.is_personal = 1
        `

        db.query(getUserInRoomsSql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }

    //lấy group được add
    //[GET] /api/group-chat-list
    checkedGroup(req, res){
        const currentUser = res.locals.username;
        var getGroupSql = `
            select name, updatedAt, id, is_personal from rooms where username='${currentUser}' AND is_show=1 AND is_personal=0 
        `
        db.query(getGroupSql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }

    
    //[GET] /api/message
    message(req, res, next){
        const idRoom = req.params.id
        const currentUser = res.locals.username
        var getMessageSql = `
            select room.id, mess.sender, mess.updatedAt, mess.message
            from messages mess, rooms room 
            where mess.idroom='${idRoom}' AND room.username='${currentUser}' AND
                mess.idroom=room.id 
            order by mess.updatedAt DESC
        `
        db.query(getMessageSql, (err, result)=>{
            if (err) throw err
            // console.log("message", result)
            res.json(result)
        })
    }

    totalGroupByUsername(req, res, next){
        const {receiver} = req.params
        var getRoomSql = `select id from rooms where username='${receiver}' AND is_personal=0`
        db.query(getRoomSql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
        
    }

    getLengthGroupByIdRoom(req, res, next){
        const idRoom = req.params.id;
        console.log('getLengthGroupByIdRoom', idRoom)
        if (idRoom === 'undefined'){
            res.json(0);
            return;
        }
       
        console.log("hihi")
        var getLengthGroup = `select count(*) as length from rooms where id=${idRoom}`
        db.query(getLengthGroup, (err, result)=>{
            if (err) throw err
            res.json(result[0].length)
        })
    }

    getIdRoomNearest(req, res){
        const currentUser = res.locals.username
        var getRoomSql = `
            select id
            from rooms 
            where username='${currentUser}' AND is_show=1
            order by updatedAt desc
        `
        db.query(getRoomSql, (err, result)=>{
            if (err) throw(err)
            // console.log('getIdRoomNearest', result)
            if (result.length > 0){
                return res.json(result[0].id);
            }
            res.json(0)
        })
    }

    userInRoom(req, res){
        const currentUser = res.locals.username;
        const idRoom = req.params.id;
        console.log(idRoom)
        var getUserInRoomsSql = `
            select username, is_host from rooms where id=${idRoom};
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
        var getInfoRoom = `select * from rooms where username!='${currentUser}' AND id=${idRoom}`
        db.query(getInfoRoom, (err, result)=>{
            if (err) throw err
            // console.log('groupCurrentUserByIdRoom', result);
            res.json(result[0]);
        })
    }

    hostUserInRoom(req, res){
        var id = req.params.id;
        var getUserHostSql = `select username from rooms where id=${id} AND is_host=1`
        db.query(getUserHostSql, (err, result)=>{
            if (err) throw err;
            res.json(result[0]);
        })
    }

    async idRoomOnline(req, res){
        const io = req.app.get('socketio');
        const currentUser = await sqlHelper.getInfoUser(res.locals.username)
        var roomOnline = await sqlHelper.filterAndGetRoomOnline(io.sockets.adapter.rooms, currentUser);
        res.json(roomOnline);

    }


}

module.exports = new apiController()
