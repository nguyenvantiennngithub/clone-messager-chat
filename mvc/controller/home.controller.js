const db = require('../../db/connect.db')
const sqlHelper = require('../../helpers/sqlHelper')
class homeController{
    //[GET] /
    async home(req, res){
        if (res.locals.isAuth){
            var currentUser = res.locals.username;
            const messages = []
            var idRoom = await sqlHelper.getIdRoomNearest(currentUser)
            return res.render('chat',{messages, currentUser, idRoom})
        }

        res.render('home', {
            messageError: '',
            username: '',
            password: '',
        })
    }
    //[GET] /chat/:id
    async chat(req, res){
        const io = req.app.get('socketio') //lay socket
        const currentUser = res.locals.username
        var idRoom = req.params.idroom
        if (!idRoom){
            idRoom = await sqlHelper.getIdRoomNearest(currentUser)
           res.render("chat", {currentUser, idRoom})
           return;
        }
        console.log("ctrl/home", idRoom, currentUser)


        //check xem currentUser co room nay hay khong
        var checkRoomSql = `select * from rooms where username='${currentUser}' AND id='${idRoom}'`
        db.query(checkRoomSql, async function(err, result){
            if (err) throw err
            if (result.length == 1){ // nếu có thì vào db lấy rồi render ra
                var getMessagesSql = `select sender, message from messages where idroom='${idRoom}'`
                db.query(getMessagesSql, (err, result)=>{
                    if (err) throw err
                    var messages = result
                    res.render("chat", {messages, currentUser, idRoom})
                    
                })
            }else{//cponf không thì trả về không tồn tại
                res.render("chat", {messages: [{sender: undefined, message: 'Người dùng không tồn tại'}], currentUser, idRoom})
            }
        })        
        
    }

    async addChatList(req, res, next){
        const io = req.app.get('socketio') //lay socket
        //nhận data tùy vào add 1 user hoặc add nhiều user
        var receiver = req.body.receiver || req.body['receivers[]']
        if (!Array.isArray(receiver)){
            receiver = [receiver]
        }
        const currentUser = res.locals.username
        console.log("addChatList", {currentUser, receiver})

        for (const user of receiver){

            // get thông tin của sender và receier 
            var infoSender = await sqlHelper.getInfoUser(currentUser);
            var infoReceiver = await sqlHelper.getInfoUser(user);

            var getIdRoom = await sqlHelper.getIdRoom(currentUser, user);
            var maxIdRoom = await sqlHelper.getMaxIdRoom() + 1;//để insert vào db

            var idRoom = (getIdRoom > 0) ? getIdRoom : maxIdRoom;

            //get room của 2 người này 
            //nếu lớn hơn 0 tức là đã có room thì update
            if (getIdRoom > 0){
                //set updatedAt của sender 
                sqlHelper.setUpdatedAt(currentUser, idRoom)
            }else{//conf ko thì là chưa có room
                // insert vào db cho sender và receiver 
                sqlHelper.insertAddChatListPersonal(currentUser, idRoom, 1, infoSender.nickname);//insert cho sender
                sqlHelper.insertAddChatListPersonal(user, idRoom, 0, infoReceiver.nickname);//insert cho receiver 
            }
            // receiver là user name của người nhận, nickname là nick name của người nhân
            // isActive là khi bên client bắt đc sk thì nó add class active vào cho nó để nó nổi bật lên ko
            sqlHelper.emit(user, 'add chat list',     {receiver: currentUser, idRoom: idRoom, nickname: infoSender.nickname, isActive: false, isPersonal: true}, io)
            sqlHelper.emit(currentUser, 'add chat list', {receiver: receiver, idRoom: idRoom, nickname: infoReceiver.nickname, isActive: true, isPersonal: true}, io)
        }
        res.end()
    }
    

    async createGroupChat(req, res){
        const io = req.app.get('socketio')
        const usernames = req.body['usernames[]']//danh sách các user được 
        const name = req.body.name;//ten cua group
        const currentUser = res.locals.username//user hien tai

        //idRoom de insert vao db tang dan
        const idRoom = await sqlHelper.getMaxIdRoom() + 1;
        console.log("createGroupChat", {usernames, name})
        //lặp qua các user được chọn để tạo group
        usernames.forEach(async (user)=>{
            if (user == currentUser){//nếu là currentUser thì active nó và cho nó là host
                //username, idRoom, is_show, name, is_host
                sqlHelper.insertAddChatListGroup(currentUser, idRoom, 1, name, 1)
                sqlHelper.emit(user, 'add chat list', {groupName: name, idRoom: idRoom, isActive: true, isPersonal: false}, io)
            }else{//cái này là mấy thằng còn lại
                sqlHelper.insertAddChatListGroup(user, idRoom, 1, name, 0)
                sqlHelper.emit(user, 'add chat list', {groupName: name, idRoom: idRoom, isActive: false, isPersonal: false}, io)
            }
            
        })
        res.end();
    }


    async addGroupChat(req, res, next){
        const io = req.app.get('socketio')
        const {userAdd} = req.body;
        var idRooms = req.body['idRooms[]']
        const currentUser = res.locals.username
        console.log('addGroupChat', {idRooms, userAdd})
        if (!Array.isArray(idRooms)){
            idRooms = [idRooms]
        }
        idRooms.forEach(async (idRoom)=>{
            var groupName = await sqlHelper.getGroupName(currentUser, idRoom)
            sqlHelper.insertAddChatListGroup(userAdd, idRoom, 1, groupName, 0)
            sqlHelper.emit(userAdd, 'add chat list', {groupName: groupName, idRoom: idRoom, isActive: false, isPersonal: false}, io)
        })

        res.end()
    }
    //khi mà có tinh nhắn
    async setUpdatedGroupChat(req, res, next){
        const io = req.app.get('socketio')
        // const {username, idRoom} = req.body;
        const idRoom = req.body.idRoom;//room cần set lại
        
        const currentUser = res.locals.username//người dùng hiện tại
        const usernames = await sqlHelper.getUserInRoom(idRoom)//những user có trong room đó
        const groupName = await sqlHelper.getGroupName(currentUser, idRoom);//tên group đó

        console.log("setUpdatedAtGroupChat", usernames);

        usernames.forEach((user)=>{
            if (user == currentUser){//nếu là currentUser thì active nó lên
                sqlHelper.setUpdatedAt(user, idRoom);//set lại cái updatedAt là now và is_show là 1
                //emit tới client
                sqlHelper.emit(user, 'add chat list', {groupName: groupName, idRoom: idRoom, isActive: true, isPersonal: false}, io)
            }else{
                sqlHelper.setUpdatedAt(user, idRoom);//set lại cái updatedAt là now và is_show là 1
            }
        })


        res.end();
    }

    hideChatList(req, res, next){ //ham an chat list
        const io = req.app.get('socketio') //lay socket
        const {idRoom} = req.body
        const currentUser = res.locals.username

        console.log("home/hideChatList", {idRoom: idRoom})
        // khi ma an thi chi can sua cai is_show=0 thoi
        sqlHelper.setIsShow(currentUser, idRoom);
        sqlHelper.emit(currentUser, 'hide chat list', {idRoom}, io)
        
        res.end()
    }
    async changeName(req, res){
        const {text, idRoom} = req.body;
        console.log({text, idRoom})
        const currentUser = res.locals.username
        var isPersonal = await sqlHelper.getIsPersonal(currentUser, idRoom);
        console.log("isPersonal", isPersonal)
        var sql;
        if (isPersonal){
            sql = `update rooms set name='${text}' 
                where username!='${currentUser}' AND id='${idRoom}'`
        }else{
            sql = `update rooms set name='${text}' 
                where id='${idRoom}'`
        }
        db.query(sql, (err, result)=>{
            if (err) throw err;;
        })
        res.end()
    }

    kickOutGroup(req, res){
        const {idRoom, receiver} = req.body;
        console.log({idRoom, receiver})
        var deleteUserSql = `delete from rooms where id=${idRoom} AND username='${receiver}'`;
        db.query(deleteUserSql, (err, result)=>{
            if (err) throw err;
            res.end();
        })
    }
}

module.exports = new homeController()

