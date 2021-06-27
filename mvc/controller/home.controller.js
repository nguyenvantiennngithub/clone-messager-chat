const db = require('../../db/connect.db')
const sqlHelper = require('../../helpers/sqlHelper')
class homeController{
    //[GET] /
    async home(req, res){
        if (res.locals.isAuth){
            var currentUser = res.locals.username;
            const messages = []
            var idRoom = await sqlHelper.getIdRoomNearest(currentUser)
            return res.redirect(`chat/${idRoom}`)
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
        var infoCurrentUser = await sqlHelper.getInfoUser(currentUser);
        var avatar = infoCurrentUser.avatar    
        var idRoom = req.params.idroom
        
        if (!idRoom){
            idRoom = await sqlHelper.getIdRoomNearest(currentUser)
           res.render("chat", {currentUser, idRoom, avatar})
           return;
        }
        // console.log("ctrl/home", idRoom, currentUser)


        //check xem currentUser co room nay hay khong
        var checkRoomSql = `select * from rooms where username='${currentUser}' AND id='${idRoom}'`
        db.query(checkRoomSql, async function(err, result){
            if (err) throw err
            if (result.length == 1){ // nếu có thì vào db lấy rồi render ra
                var getMessagesSql = `select sender, message from messages where idroom='${idRoom}'`
                db.query(getMessagesSql, (err, result)=>{
                    if (err) throw err
                    var messages = result
                    res.render("chat", {messages, currentUser, idRoom, avatar})
                    
                })
            }else{//cponf không thì trả về không tồn tại
                res.render("chat", {messages: [{sender: undefined, message: 'Người dùng không tồn tại'}], currentUser, idRoom, avatar})
            }
        })        
        
    }

    async createOrAddChatListPersonal(req, res, next){

        const io = req.app.get('socketio') //lay socket
        const currentUser = res.locals.username
        //nhận data tùy vào add 1 user hoặc add nhiều user
        var receiver = req.body.receiver || req.body['receivers[]']
        if (!Array.isArray(receiver)){
            receiver = [receiver]
        }

        console.log(receiver)
        var infoSender = await sqlHelper.getInfoUser(currentUser);
        var infoReceiver;

        var isShowReceiver = req.body.isShowReceiver ? 1 : 0; 
        // console.log("addChatList", {currentUser, receiver})
        for (const user of receiver){
            // get thông tin của sender và receier 
            infoReceiver = await sqlHelper.getInfoUser(user);
            // console.log("==infoReceiver", infoReceiver, user);
            var getIdRoom = await sqlHelper.getIdRoom(currentUser, user);
            var maxIdRoom = await sqlHelper.getMaxIdRoom() + 1;//để insert vào db

            var idRoom = (getIdRoom > 0) ? getIdRoom : maxIdRoom;
            //get room của 2 người này 
            //nếu lớn hơn 0 tức là đã có room thì update
            if (getIdRoom > 0){
                //set updatedAt của sender 
                sqlHelper.setUpdatedAt(currentUser, idRoom, 1)
                sqlHelper.setUpdatedAt(user, idRoom, isShowReceiver)
            }else{//conf ko thì là chưa có room
                // insert vào db cho sender và receiver
                sqlHelper.insertAddChatListPersonal(currentUser, idRoom, 1, infoSender.nickname);//insert cho sender
                sqlHelper.insertAddChatListPersonal(user, idRoom, 0, infoReceiver.nickname);//insert cho receiver 
            }
            // emit tới sender nên đưa thông tin của receiver để render  
            // isActive là khi bên client bắt đc sk thì nó add class active vào cho nó để nó nổi bật lên ko
            var dataReceiver = {
                receiver: currentUser, 
                idRoom: idRoom, 
                nickname: infoSender.nickname, 
                avatar: infoSender.avatar,
                isActive: false, 
                isPersonal: true
            }

            var dataSender = {
                receiver: receiver, 
                idRoom: idRoom, 
                nickname: infoReceiver.nickname,
                avatar: infoReceiver.avatar,
                isActive: true, 
                isPersonal: true
            }
            sqlHelper.emit(user, 'add chat list', dataReceiver, io)
            sqlHelper.emit(currentUser, 'add chat list', dataSender, io)
        }
        var response = {"status" : 200} 
        res.end(JSON.stringify(response))
    }
    

    async createGroupChat(req, res){
        const io = req.app.get('socketio')
        // console.log("=========", req.body, req.files)
        const usernames = req.body.usernames.split(',') 
        const name = req.body.name;//ten cua group
        const currentUser = res.locals.username//user hien tai
        const avatar = req.files.avatar
        const avatarDB = '/uploads/' + avatar.md5

        //idRoom de insert vao db tang dan
        const idRoom = await sqlHelper.getMaxIdRoom() + 1;


        avatar.mv('public/uploads/' + avatar.md5 , function(err){
            console.log(err);
        })
        //lặp qua các user được chọn để tạo group
        usernames.forEach(async (user)=>{
            var isHost = (user == currentUser) ? 1 : 0
            var isActive = (user == currentUser) ? true : false
            var data = {
                groupName: name, 
                idRoom: idRoom, 
                isActive: isActive, 
                isPersonal: false,
                isHost: isHost,
                avatar: avatarDB
            }

            sqlHelper.insertAddChatListGroup(user, idRoom, 1, name, isHost, avatarDB)
            sqlHelper.emit(user, 'add chat list', data, io)
            
        })
        res.end();
    }



    async addUserToGroups(req, res, next){
        const io = req.app.get('socketio')
        var usernames = req.body.username || req.body['usernames[]'];
        var idRooms = req.body.idRoom || req.body['idRooms[]']
        const currentUser = res.locals.username

        if (!Array.isArray(idRooms)){
            idRooms = [idRooms]
        }
        if (!Array.isArray(usernames)){
            usernames = [usernames];
        }

        // console.log('addGroupChat', {usernames, idRooms})

        for (const username of usernames){
            for (const idRoom of idRooms){
                var infoGroup = await sqlHelper.getInfoGroupByUsernameIdRoom(currentUser, idRoom)
                var data = {
                    groupName: infoGroup.name, 
                    idRoom: idRoom, 
                    isActive: true, 
                    isPersonal: false,
                    avatar: infoGroup.avatar,
                }
                console.log(data, infoGroup);
                sqlHelper.insertAddChatListGroup(username, idRoom, 1, infoGroup.name, 0, infoGroup.avatar)
                sqlHelper.emit(username, 'add chat list', data, io)
            }
        }
        res.end()
    }

    //khi mà có tinh nhắn
    async setUpdatedGroupChat(req, res, next){
        const io = req.app.get('socketio')
        const {isShowReceiver, idRoom} = req.body;
        var isShowReceiverNumber = isShowReceiver ? 1 : 0;
        const currentUser = res.locals.username
        const usernames = await sqlHelper.getUserInRoom(idRoom)
        const infoGroup = await sqlHelper.getInfoGroupByUsernameIdRoom(currentUser, idRoom);
        
        var data = {
            groupName: infoGroup.name, 
            idRoom: idRoom, 
            avatar: infoGroup.avatar,
            isPersonal: false,
        }

        usernames.forEach((user)=>{
            
            data.isActive = (user == currentUser) ? true : false;
            
            sqlHelper.setUpdatedAt(user, idRoom, isShowReceiverNumber);
            if (isShowReceiver || user == currentUser){
                sqlHelper.emit(user, 'add chat list', data, io)
            }
        })


        res.end();
    }

    hideChatList(req, res, next){ //ham an chat list
        const io = req.app.get('socketio') //lay socket
        const {idRoom} = req.body
        const currentUser = res.locals.username

        // console.log("home/hideChatList", {idRoom: idRoom})
        // khi ma an thi chi can sua cai is_show=0 thoi
        sqlHelper.setIsShow(currentUser, idRoom);
        sqlHelper.emit(currentUser, 'hide chat list', {idRoom}, io)
        
        res.end()
    }
    async changeNameThreadChat(req, res){
        const {text, idRoom} = req.body;
        // console.log({text, idRoom})
        const currentUser = res.locals.username
        var isPersonal = await sqlHelper.getIsPersonal(currentUser, idRoom);
        // console.log("isPersonal", isPersonal)
        var sql;
        if (isPersonal){
            sql = `update rooms set nickname='${text}' 
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
        console.log("kickOutGroup", {idRoom, receiver})
        var deleteUserSql = `delete from rooms where id=${idRoom} AND username='${receiver}'`;
        db.query(deleteUserSql, (err, result)=>{
            if (err) throw err;
            res.end();
        })
    }

    appointGroupAdmin(req, res){
        const {username, idRoom} = req.body;
        const currentUser = res.locals.username;
        sqlHelper.setIsHost(username, idRoom, 1);
        sqlHelper.setIsHost(currentUser, idRoom, 0);
        res.end();
    }
}

module.exports = new homeController()

