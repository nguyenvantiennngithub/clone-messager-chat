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

        return res.render('home', {
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
           res.redirect('/chat/' + idRoom);
           return;
        }
        res.render("chat", {infoCurrentUser, idRoom, avatar})
    }

    async videoCall(req, res){
        var currentUser = res.locals.username;
        var infoCurrentUser = await sqlHelper.getInfoUserByUsername(currentUser);

        res.render('video', {currentUser: infoCurrentUser});
    }

    async createOrAddChatListPersonal(req, res, next){

        const io = req.app.get('socketio') //lay socket
        const currentUser = res.locals.username
        var nickname;
        //nhận data tùy vào add 1 user hoặc add nhiều user
        var receiver = req.body.receiver || req.body['receivers[]'] || req.body.receivers
        if (!Array.isArray(receiver)){
            receiver = [receiver]
        }
        const {isShowReceiver} = req.body
        // console.log(receiver, req.body, req.body.receivers);
        var infoSender = await sqlHelper.getInfoUser(currentUser);
        var infoReceiver;

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
                sqlHelper.setUpdatedAt(user, idRoom, 1)
                var infoReceiverRoom = await sqlHelper.getUserInRoomByUsernameIdRoom(user, idRoom);
                nickname = infoReceiverRoom.nickname;

            }else{//conf ko thì là chưa có room\
                // insert vào db cho sender và receiver
                sqlHelper.insertAddChatListPersonal(currentUser, idRoom, 1, infoSender.nickname);//insert cho sender
                sqlHelper.insertAddChatListPersonal(user, idRoom, 0, infoReceiver.nickname);//insert cho receiver
                nickname = infoReceiver.nickname
            }
            // emit tới sender nên đưa thông tin của receiver để render  
            // isActive là khi bên client bắt đc sk thì nó add class active vào cho nó để nó nổi bật lên ko
            var dataReceiver = {
                receiver: currentUser, 
                idRoom: idRoom, 
                nicknameRoom: infoSender.nickname, 
                avatar: infoSender.avatar,
                isActive: false, 
                isPersonal: true
            }

            var dataSender = {
                receiver: receiver, 
                idRoom: idRoom,
                nicknameRoom: nickname,
                avatar: infoReceiver.avatar,
                isActive: isShowReceiver, 
                isPersonal: true
            }

            if (isShowReceiver){
                sqlHelper.emit(user, 'add chat list', dataReceiver, io)
            }
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



    async addUsersToGroups(req, res, next){
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
                    isActive: false, 
                    isPersonal: false,
                    avatar: infoGroup.avatar,
                }
                // console.log(data, infoGroup);
                sqlHelper.insertAddChatListGroup(username, idRoom, 1, infoGroup.name, 0, infoGroup.avatar)
                sqlHelper.emit(username, 'add chat list', data, io)
            }
        }
        res.end()
    }

    //khi mà có tinh nhắn
    async sendMessage(req, res, next){
        console.log(req.body)
        const io = req.app.get('socketio')
        const {idRoom} = req.body;
        const currentUser = res.locals.username
        const usernames = await sqlHelper.getUserInRoom(idRoom)
        const infoGroup = await sqlHelper.getInfoGroupByUsernameIdRoom(currentUser, idRoom);
        
        if (!usernames.includes(currentUser)){
            return sqlHelper.emit(currentUser, 'error cant send message', 'You are not in the room', io)
        }

        var data = {
            groupName: infoGroup.name, 
            idRoom: idRoom, 
            avatar: infoGroup.avatar,
            isPersonal: false,
            isActive: false,
            countUnRead: 1,
        }

        usernames.forEach((user)=>{
            sqlHelper.setUpdatedAt(user, idRoom, 1);
            sqlHelper.emit(user, 'add chat list', data, io)
        })


        res.end();
    }

    async addChatListGroup(req, res, next){
        var {idRoom} = req.body;
        const io = req.app.get('socketio')
        const currentUser = res.locals.username;
        const infoGroup = await sqlHelper.getInfoGroupByUsernameIdRoom(currentUser, idRoom);
        var data = {
            groupName: infoGroup.name, 
            idRoom: idRoom, 
            avatar: infoGroup.avatar,
            isPersonal: false,
            isActive: true,
        }
        sqlHelper.setUpdatedAt(currentUser, idRoom, 1);
        sqlHelper.emit(currentUser, 'add chat list', data, io)
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

