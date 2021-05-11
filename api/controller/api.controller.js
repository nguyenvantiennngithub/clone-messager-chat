const { createPool } = require('mysql')
const db = require('../../db/connect.db')

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
            select receiver.id, receiver.username, r.updatedAt, user.nickname, r.is_personal 
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
            select * from messages mess, rooms room 
            where mess.idroom='${idRoom}' AND room.username='${currentUser}' AND
                mess.idroom=room.id 
        `
        db.query(getMessageSql, (err, result)=>{
            if (err) throw err
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

    groupCurrentUserByIdRoom(req, res, next){
        const currentUser = res.locals.username;
        const idRoom = req.params.id;
        console.log('groupCurrentUserByIdRoom', {currentUser, idRoom})
        var getInfoRoom = `select * from rooms where username='${currentUser}' AND id=${idRoom}`
        db.query(getInfoRoom, (err, result)=>{
            if (err) throw err
            res.json(result[0]);
        })
    }
}

module.exports = new apiController()
