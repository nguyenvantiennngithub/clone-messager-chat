const db = require('../../db/connect.db')
const functionClass = require('../../public/js/function')
class homeController{
    //[GET] /
    async home(req, res){
        if (res.locals.isAuth){
            var currentUser = res.locals.username;
            const messages = []
            var idRoom = await functionClass.getIdRoomNearest(currentUser)
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
        console.log({idRoom})
        if (!idRoom){
            idRoom = await functionClass.getIdRoomNearest(currentUser)
            console.log({idRoom})
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
                    console.log({messages, currentUser, idRoom})
                    res.render("chat", {messages, currentUser, idRoom})
                    
                })
            }else{//cponf không thì trả về không tồn tại
                res.render("chat", {messages: [{sender: 'empty', message: 'Người dùng không tồn tại'}], currentUser, idRoom})
            }
        })        
        
    }
    /**
     * Send Message
     * -Emit toi server {idRoom, sender, message} => insert vào db và emit lại cho client để render html
     * -Gọi ajax để cập nhật updatedAt 
     *      +Personal, Group: gọi functionClass.setUpdated(username, idRoom) để set updatedAt
     *      sau đó sẽ emit tới client để render ra html
     * Add Chat List
     * -Kiểm tra xem nó là Personal hay Group
     *      +Personal: Kiểm tra xem đã có Room chưa
     *          +Có thì gọi functionClass.setUpdated(username, idRoom) để set updatedAt
     *          +Chưa thì insert vào db
     *               Final: sau đó sẽ emit tới client để render ra html
     *      
     *      +Group: gọi functionClass.setUpdated(username, idRoom) để set updatedAt
     *              sau đó sẽ emit tới client để render ra html
     *      
     */

    async addChatList(req, res, next){
        const io = req.app.get('socketio') //lay socket
        console.log('startttttttttttttttttttttttttttt')
        //nhận data tùy vào add 1 user hoặc add nhiều user
        var receiver = req.body.receiver || req.body['receivers[]']
        if (!Array.isArray(receiver)){
            receiver = [receiver]
        }
        console.log(receiver)
        const currentUser = res.locals.username
        console.log("addChatList", {currentUser, receiver})

        for (const user of receiver){

            console.log("console 1", user)
            // get thông tin của sender và receier 
            var infoSender = await functionClass.getInfoUser(currentUser);
            var infoReceiver = await functionClass.getInfoUser(user);

            var getIdRoom = await functionClass.getIdRoom(currentUser, user);
            var maxIdRoom = await functionClass.getMaxIdRoom() + 1;//để insert vào db

            var idRoom = (getIdRoom > 0) ? getIdRoom : maxIdRoom;

            console.log('console 2', idRoom)
            //get room của 2 người này 
            //nếu lớn hơn 0 tức là đã có room thì update
            if (getIdRoom > 0){
                //set updatedAt của sender 
                functionClass.setUpdatedAt(currentUser, idRoom)
            }else{//conf ko thì là chưa có room
                // insert vào db cho sender và receiver 
                functionClass.insertAddChatListPersonal(currentUser, idRoom, 1, infoReceiver.nickname);//insert cho sender
                functionClass.insertAddChatListPersonal(user, idRoom, 0, infoSender.nickname);//insert cho receiver 
            }
            // receiver là user name của người nhận, nickname là nick name của người nhân
            // isActive là khi bên client bắt đc sk thì nó add class active vào cho nó để nó nổi bật lên ko
            functionClass.emit(user, 'add chat list personal', {receiver: currentUser, id: idRoom, nickname: infoSender.nickname, isActive: false}, io)
            functionClass.emit(currentUser, 'add chat list personal', {receiver, id: idRoom, nickname: infoReceiver.nickname, isActive: true}, io)
        }
        res.end()
    }
    

    async createGroupChat(req, res){
        const io = req.app.get('socketio')
        const usernames = req.body['usernames[]']//danh sách các user được 
        const name = req.body.name;//ten cua group
        const currentUser = res.locals.username//user hien tai

        //idRoom de insert vao db tang dan
        const idRoom = await functionClass.getMaxIdRoom() + 1;
        console.log("createGroupChat", {usernames, name})
        //lặp qua các user được chọn để tạo group
        usernames.forEach(async (user)=>{
            if (user == currentUser){//nếu là currentUser thì active nó và cho nó là host
                functionClass.insertAddChatListGroup(currentUser, idRoom, 1, name, 1)
                functionClass.emit(user, 'add chat list group', {groupName: name, idRoom: idRoom, isActive: true}, io)
            }else{//cái này là mấy thằng còn lại
                functionClass.insertAddChatListGroup(user, idRoom, 1, name, 0)
                functionClass.emit(user, 'add chat list group', {groupName: name, idRoom: idRoom, isActive: false}, io)
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
            var groupName = await functionClass.getGroupName(currentUser, idRoom)
            console.log(userAdd, idRoom, 1, groupName)
            functionClass.insertAddChatListGroup(userAdd, idRoom, 1, groupName, 0)
            functionClass.emit(userAdd, 'add chat list group', {groupName: groupName, idRoom: idRoom, isActive: false}, io)
        })

        res.end()
    }
    //khi mà có tinh nhắn
    async setUpdatedGroupChat(req, res, next){
        const io = req.app.get('socketio')
        // const {username, idRoom} = req.body;
        const idRoom = req.body.idRoom;//room cần set lại
        
        const currentUser = res.locals.username//người dùng hiện tại
        const usernames = await functionClass.getUserInRoom(idRoom)//những user có trong room đó
        const groupName = await functionClass.getGroupName(currentUser, idRoom);//tên group đó

        console.log("setUpdatedAtGroupChat", usernames);

        usernames.forEach((user)=>{
            console.log(user)//lặp qua
            if (user == currentUser){//nếu là currentUser thì active nó lên
                functionClass.setUpdatedAt(user, idRoom);//set lại cái updatedAt là now và is_show là 1
                //emit tới client
                functionClass.emit(user, 'add chat list group', {groupName: groupName, idRoom: idRoom, isActive: true}, io)
            }else{
                functionClass.setUpdatedAt(user, idRoom);//set lại cái updatedAt là now và is_show là 1
                functionClass.emit(user, 'add chat list group', {groupName: groupName, idRoom: idRoom, isActive: false}, io)
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
        functionClass.setIsShow(currentUser, idRoom);
        functionClass.emit(currentUser, 'hide chat list', {idRoom}, io)
        
        res.end()
    }
}

module.exports = new homeController()

