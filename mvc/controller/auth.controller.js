const db = require('../../db/connect.db')
const bcrypt = require('bcryptjs')
class authController{
    //[POST] /auth/checkLogin
    checkLogin(req, res){
        const {username, password} = req.body
        var sql = `select password from users where username='${username}'`
        db.query(sql, (err, result)=>{
            if (err) console.log(err)
            if (result.length == 1){
                var isMatch = bcrypt.compareSync(password, result[0].password)
                if (isMatch){
                    req.session.isAuth = isMatch
                    console.log(req.session.isMatch)
                    req.session.username = username
                    console.log("go to chat")
                    return res.redirect('/chat')
                }
            }
            res.render('home', {
                messageError: 'Wrong username or password',
                username: username,
                password: password,
            })
        })
    }

    //[GET] /auth/register
    register(req, res){
        res.render('register', {
            nickname: '',
            username: '',
            password: '',
            messageError: ''
        })
    }

    //[POST] /auth/checkRegister
    checkRegister(req, res){
        const saltRounds = 8
        const {nickname, username, password, socketid} = req.body
        const hashPsw = bcrypt.hashSync(password, saltRounds);
        var sql = `select * from users where username='${req.body.username}'`
        db.query(sql, (err, result)=>{
            if (err) console.log(err)
            console.log(result)
            if (result.length == 0){
                var insert = `insert into users (nickname, username, password, socketid) values ('${nickname}', '${username}', '${hashPsw}', '${socketid}')`
                db.query(insert, (err, result)=>{
                    if (err) console.log(err)
                    else return res.send("ok insert successfully await redirect to chat page")
                })
            }else{
                return res.render('register', {
                    nickname: nickname,
                    username: username,
                    password: password,
                    messageError: 'Username is available'
                })
            }
        })
    }
    logout(req, res){
        req.session.destroy(function(err) {
            if (err) throw err
            res.redirect('/')
          })
    }
}


module.exports = new authController()
