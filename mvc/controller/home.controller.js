const db = require('../../db/connect.db')
const functionClass = require('../../public/js/function')
const { get } = require('../router/home.router')
class homeController{
    //[GET] /
    home(req, res){
        res.render('home', {
            messageError: '',
            username: '',
            password: '',
        })
    }
    //[GET] /chat/:id
    chat(req, res){
        console.log(req.params)
        res.render("chat")
    }

    chat1(req, res){
        res.render("chat")
    }

    addChatList(req, res, next){
        const io = req.app.get('socketio') //lay socket
        const {sender, receiver} = req.body
        console.log(req.body)
        

        //đầu tiên kiểm tra xem có trong db chưa
        var getReceiverSql = `
            select username, id from rooms 
            where username='${receiver}' AND id in (select id from rooms where username='${sender}')`
        db.query(getReceiverSql, (err, result)=>{
            if (err) throw err
            if (result.length === 0){//nếu chưa thì insert vào db
                var idRoom //lưu giá trị id để insert vào db
                
                //vì ko để id tự tăng nên phải lấy ra id để tăng lên rồi insert vaof id
                var getIdSql = `select max(id) as 'maxId' from rooms `
                db.query(getIdSql, (err, result)=>{
                    if (err) throw err
                    idRoom = result[0].maxId + 1
                    //rồi sau đó insert vào db
                    // console.log(idRoom)

                    var insertRoomsSql = `
                        insert into rooms (id, username, is_show) 
                        values (${idRoom}, '${sender}', 1), (${idRoom}, '${receiver}', 0)`
                    db.query(insertRoomsSql, (err, result)=>{
                        if (err) throw err
                        //emit tới client để nó render html
                        functionClass.getSocketid(sender).then((socketIdSender)=>{
                            io.in(socketIdSender).emit('sender add chat list', {receiver, id: idRoom})
                        })
                    })
            })

                
                
            }else{//còn có rồi thì sửa cái is_show và cái updatedAt lại
                var updateUpdatedAtSql = `
                    update rooms 
                    set is_show=1, updatedAt=CURRENT_TIMESTAMP() 
                    where username='${sender}' AND id in (select id from rooms where username='${receiver}')
                `
                db.query(updateUpdatedAtSql, (err, result)=>{
                    if (err) throw err
                    var getIdRoom = `
                        select id from rooms 
                        where username='${sender}' AND id in (select id from rooms where username='${receiver}')`
                    db.query(getIdRoom, (err, result)=>{
                        if (err) throw err
                        var idRoom = result[0].id
                        functionClass.getSocketid(sender).then((socketIdSender)=>{
                            io.in(socketIdSender).emit('sender add chat list', {receiver, id: idRoom})
                        })
                    })
                })
            }
            
        })

        res.end()
    }
    hideChatList(req, res, next){ //ham an chat list
        const io = req.app.get('socketio') //lay socket
        const {sender, receiver} = req.body
        console.log("hidechatlsit", req.body)
        // khi ma an thi chi can sua cai is_show=0 thoi
        var updateIsShowSql = `
            update rooms set is_show=0 
            where username='${sender}' AND id in (select id from rooms where username='${receiver}')`
        db.query(updateIsShowSql, (err, result)=>{
            if (err) throw err
                functionClass.getSocketid(sender).then((socketIdSender)=>{//xong thi emit len sever de render ra thang user do ok
                io.in(socketIdSender).emit('sender remove chat list', {receiver})
            })
        })

        res.end()
    }
}

module.exports = new homeController()

