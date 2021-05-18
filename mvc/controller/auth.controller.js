const db = require('../../db/connect.db')
const bcrypt = require('bcryptjs')
const functionClass = require('../../public/js/function')
class authController{
    //[POST] /auth/checkLogin
    async checkLogin(req, res){
        const {username, password} = req.body
        var messageError = 'Wrong username or password'
        console.log({username, password})
        
        var flag = await functionClass.checkUser(username);
        
        if (flag){
            req.session.isAuth = isMatch
            req.session.username = username
            messageError = ''
            res.redirect('/chat')
        }else{

        }
        
        // res.render('home', {
        //     messageError,
        //     username: username,
        //     password: password,
        // })
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
        const io = req.app.get('socketio');
        const {nickname, username, password, socketid} = req.body
        const hashPsw = bcrypt.hashSync(password, saltRounds);

        //tìm xem là user này đã tồn tại chưa
        var sql = `select * from users where username='${req.body.username}'`
        db.query(sql, (err, result)=>{
            if (err) console.log(err)
            if (result.length == 0){ // nếu chưa tồn tại thì insert vào db
                var insert = `insert into users (nickname, username, password, socketid) values ('${nickname}', '${username}', '${hashPsw}', '${socketid}')`
                db.query(insert, (err, result)=>{
                    if (err) console.log(err)
                    else{
                        io.emit('new user', {username, nickname}) //sau khi đã insert thì sẽ báo cho clinet biết
                        return res.redirect("/")
                    } 
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
