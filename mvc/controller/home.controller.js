const db = require('../../db/connect.db')
const functionClass = require('../../public/js/function')
class homeController{
    home(req, res){
        res.render('home', {
            messageError: '',
            username: '',
            password: '',
        })
    }
    chat(req, res){
        res.render("chat")
    }

    addChatList(req, res, next){
        //hàm lấy socketid từ db để tránh trùng code gây mệt mỏi cho mắt
        const io = req.app.get('socketio')
        const {sender, receiver} = req.body
        console.log(req.body)
        //đầu tiên là kiểm tra xem cái sender và receiver này đa được add chưa
        var sqlCheckExists = `select * from list_receiver where sender='${sender}' AND receiver='${receiver}'`
        db.query(sqlCheckExists, (err, result)=>{
            if (err) throw err
            //nếu chưa được add thì add còn add rồi thì thôi
            //sau khi add thì phải emit về cho 2 người
            //1 là sender 2 là receiver 
            //mà bắt buộc khi emit về receiver thì phải có socketid của ngdo 
            //chứ ko thể dùng username của receiver được nên là phải lấy 
            //cái username của receiver vài db để lấy ra socketid
            if (result.length == 0){
                //insert vào db 
                //insert 2 cái 1 là của sender receiver 2 là receiver sender
                sqlCheckExists = `select * from list_receiver where sender='${sender}' AND receiver='${receiver}'`
                db.query(sqlCheckExists, (err, result)=>{
                    if (err) throw err
                    if (result.length == 0){
                        var insertSender = `insert into list_receiver (sender, receiver) values ('${sender}', '${receiver}')`
                        db.query(insertSender, (err, result)=>{
                            if (err) throw err
                            else{
                                // emit tới người gữi
                                functionClass.getSocketid(sender).then((socketidSender)=>{
                                    io.in(socketidSender).emit('sender add chat list', {receiver})
                                })
                            }
                        })
                    }
                   
                })
               
                //kiem tra ton tai roi moi insert vao
                sqlCheckExists = `select * from list_receiver where sender='${receiver}' AND receiver='${sender}'`
                db.query(sqlCheckExists, (err, result)=>{
                    if (err) throw err
                    if (result.length == 0){
                        var insertReceiver = `insert into list_receiver (sender, receiver) values ('${receiver}', '${sender}')`
                        db.query(insertReceiver, (err, result)=>{
                            if (err) throw err
                            else{
                                //emit tới người nhận
                                functionClass.getSocketid(receiver).then((socketidReceiver)=>{
                                    io.in(socketidReceiver).emit('receiver add chat list', {sender})
                                })
                            }
                        })
                    }

                })
            }
        })
        res.end()
    }
    hideChatList(req, res, next){
        const io = req.app.get('socketio')
        const {sender, receiver} = req.body
        var sqlDelete = `delete from list_receiver where sender='${sender}' AND receiver='${receiver}'`
        db.query(sqlDelete, (err, result)=>{
            if (err) throw err
            console.log("77 home", result)
            functionClass.getSocketid(sender).then((socketidSender)=>{
                io.in(socketidSender).emit('sender remove chat list', {receiver})
            })
        })
        res.end()
    }
}

module.exports = new homeController()
