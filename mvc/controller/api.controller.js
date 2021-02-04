const db = require('../../db/connect.db')

class apiController{
    async user(req, res, next){
        var sql = `select nickname, username, socketid from users`
        await db.query(sql, (err, result)=>{
            if (err) throw err
            res.json(result)
        })
    }
}

module.exports = new apiController()
