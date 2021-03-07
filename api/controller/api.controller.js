const db = require('../../db/connect.db')

class apiController{
    async users(req, res, next){
        var sql = `select nickname, username, socketid from users`
        await db.query(sql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }

    async user(req, res, next){
        const username = res.locals.username
        const socketid = req.session.id
        console.log('user', username)
        var sql = `select nickname, username, socketid from users u, sessions s where s.session_id='${socketid}' AND u.username='${username}'`
        db.query(sql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }

    userChatList(req, res, next){
        const username = res.locals.username
        var sql =  `select sender, receiver from list_receiver where sender='${username}'`
        db.query(sql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }
}

module.exports = new apiController()
