const db = require('../../db/connect.db')
class functionClass{
    async getSocketid(username){
        var promise = new Promise((res, rej)=>{
            var sqlGetSocketid = `select socketid from users where username='${username}'`
            db.query(sqlGetSocketid, (err, result)=>{
                if (err) throw err
                res(result[0].socketid)
            })
        })
        var result = await promise
        return result
    }
}


module.exports = new functionClass()