const db = require('../../db/connect.db')

class apiController{
    //[GET] /api/users
    async users(req, res, next){
        var sql = `select nickname, username, socketid from users`
        await db.query(sql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }

    async groups(req, res, next){
        const username = res.locals.username
        var getGroupSql = `select * from rooms where username='${username}' AND is_personal=0`
        db.query(getGroupSql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }

    //[GET] /api/users
    async user(req, res, next){
        const username = res.locals.username
        const socketid = req.session.id
        console.log('api/user', username)
        var sql = `select nickname, username, socketid from users u, sessions s where s.session_id='${socketid}' AND u.username='${username}'`
        db.query(sql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }

    //[GET] /api/user-chat-list
    receiverChatList(req, res, next){
        const currentUser = res.locals.username
        
        //sql này dùng dể lấy những username có cùng rooms với currentUser và ko lấy currentUser     
        // var getUserInRoomsSql = 
        //     `select * from rooms 
        //     where id in (select id from rooms where username='${currentUser}' AND is_show=1) AND username != '${currentUser}'`
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

    groupChatList(req, res){
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
        const currentUser = res.locals.username
        const idRoom = req.params.id
        var getMessageSql = `
            select * from messages where idroom='${idRoom}'
        `
        db.query(getMessageSql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }
}

module.exports = new apiController()
