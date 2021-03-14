const db = require('../../db/connect.db')
class functionClass{
    //ham nay nhan vao 1 cai username 
    async getSocketid(username){
        var promise = new Promise((res, rej)=>{
            //tim trong db lay ra cai usrename do roi resolve
            var sqlGetSocketid = `select socketid from users where username='${username}'`
            db.query(sqlGetSocketid, (err, result)=>{
                if (err) throw err
                res(result[0].socketid)
            })
        })
        var result = await promise //phai cho no xong moi lay dc
        return result
    }
}


module.exports = new functionClass()