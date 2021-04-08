var socket = io();
//---------------------------------------Function store html code-------------------------------------------------
//code html render ra li ben phai
function htmlItemAllUser(username, nickname){ //bên phải
    return `
     <li class="list-group-item list-group-item-success d-flex">
         <span class="text-nickname" style="font-size: 24px">${nickname}</span>
         <input class="text-username-right" value="${username}" hidden/>
         <div class="dropdown ml-auto">
             <button class="btn btn-secondary dropdown-toggle" type="button" id="right" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
             <div class="dropdown-menu" aria-labelledby="right" data-name="${username}" data-nickname="${nickname}">
                 <button class="add-chat-list dropdown-item" type="button">Thêm</button>
             </div>
         </div>
     </li>
`
}

//code html render ra li ben trai
function htmlItemListReceiver(receiver, nickname, id){ //bên trái
    return `
         <li class="list-chat-user-item list-group-item list-group-item-info d-flex" data-name="${receiver}" data-id="${id}" data-nickname="${nickname}">
             <span class="text-nickname" style="font-size: 24px">${nickname}</span>
             <input class="text-username-left" value="${receiver}" hidden>
             <div class="dropdown ml-auto">
                 <button class="btn btn-secondary dropdown-toggle" type="button" id="left" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                 <div class="dropdown-menu" aria-labelledby="left" data-name="${receiver}" data-nickname="${nickname}">
                     <button class="hide-chat-list dropdown-item" type="button">Ẩn</button>
                     <button class="create-group-chat dropdown-item" type="button">Tạo nhóm chat</button>
                 </div>
             </div>
         </li>`
}

//render message
function htmlItemListMessage(sender, message){
    
    if ($('#username').data('name') !== sender){
        return `
            <li class="list-group-item list-group-item-secondary list-group-message message-item" style="margin-right: auto">${message}</li>
        `
    }else{
        return `
            <li class="list-group-item list-group-item-success list-group-message message-item" style="margin-left: auto">${message}</li>
        `
    }
}

function htmlItemListReceiverDialog(name, nickname, isChecked){
    if (name != $('#username').text()){//khong render ra chin minh
        if (isChecked){
            return `
            <div class="dialog__choose-item">
                <input type="checkbox" name="" id="${name}" class="dialog__choose-item-input" data-name="${name}" data-nickname="${nickname}" checked>
                <label for="${name}" class="dialog__choose-item-label">${nickname}</label>
            </div>
      `
        }
        return `
            <div class="dialog__choose-item">
                <input type="checkbox" name="" class="dialog__choose-item-input" data-name="${name}" data-nickname="${nickname}">
                <label for= class="dialog__choose-item-label">${nickname}</label>
            </div>
      `
    }
}

function htmlItemUserChecked(username){
    if (username === $('#username').text()){//khong render dau X
        return `
        <div class="dialog__choose-checked-item" data-name="${username}">
            <div class="fake-padding">
                <span class="dialog__choose-checked-item-name">${username}</span>
            </div>
        </div>
    `
    }
    return `
        <div class="dialog__choose-checked-item" data-name="${username}">
            <div class="fake-padding">
                <span class="dialog__choose-checked-item-name">${username}</span>
                <div class="container-close" data-name="${username}">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        </div>
    `
}

$(document).ready(()=>{

    
//---------------------------------------Function get data from api-------------------------------------------------

    //lay thong tin user hien tai
    async function getDataCurrentUser(){
        return await axios.get('/api/user')
        .then((response)=>{
            return response.data[0]
        })
    }

    //lay thong tin tat ca user
    async function getDataAllUser(){
        return await axios.get('/api/users')
        .then((response)=>{
            return response.data
        })
    }

    //lay thong tin nhung user nam trong chatl ist
    async function getDataReceiver(){
        return await axios.get('/api/receivers')
        .then((response)=>{
            return response.data
        })
    }

    //lay ra cac message cua 2 user or group chat
    async function getDataMessages(idRoom){
        return await axios.get(`/api/messages/${idRoom}`)
        .then((response)=>{
            return response.data
        })
        
    }
    //---------------------------------------Function emit when user login to server-------------------------------------------------
    //functuon emit to server socket id of new user login
    function emitSocketIdOfCurrentUserToServer(){
        getDataCurrentUser() //[{nickname, username, socketid}]
        .then((data)=>{
            //emit về server để add socketid
            socket.id = data.socketid
            socket.emit('change socket', socket.id)
        })
        .catch((err)=>{
            throw err
        })
    }

    //---------------------------------------Function render html-------------------------------------------------

    //call api get list user chat render html
    async function renderReceivers(){
        await getDataReceiver()
        .then((data)=>{ //{sender, receiver, updatedAt, id}
            console.log(data)
            //sort theo thoi gian
            var userSort = data.sort((a, b)=>{
                var aValue = new Date(a.updatedAt).getTime()//chuyen thoi gian sang number de so sanh
                var bValue = new Date(b.updatedAt).getTime()

                return bValue - aValue 
            })        

            //render ra html            
            var html = userSort.map((user)=>{ //{sender, receiver, updatedAt, id}
                return htmlItemListReceiver(user.username, user.nickname, user.id)
            })
            $('#list-chat-user').html(html)      
        })  
        .catch((err)=>{
            throw err
        })
    }

    //call api get all user render html
    function renderAllUser(){
        // [{nickname, username, socketid}, ....]
        getDataAllUser()
        .then((data)=>{
            var html = data.map((user) => {
                if (user.username != $('#username').text()){
                    return htmlItemAllUser(user.username, user.nickname)
                }else{
                    return;
                }
            })

            $('#list-total-user').html(html)
        })
        .catch((err)=>{
            throw err
        })
    }
    function renderMessage(idRoom){
        getDataMessages(idRoom)
        .then((data)=>{
            var html = data.map((message)=>{
                return htmlItemListMessage(message.sender, message.message)
            })
            $('#list-message').html(html)
            scrollChatList()
        })
    }

    function renderReceiversDialog(option){//ham render ra dialog tro chuyen gan day
        var functionName = ""
        var html = ""
        //kiem tra xem tuy` vao option ma ta lay data khac nhau
        if (option == "all"){//lay all
            functionName = getDataAllUser
        }else if (option == "in_list"){//lay trong list receiver
            functionName = getDataReceiver
        }else{ //thang nay la lay nhung thang da chon
            $('.dialog__choose-item-input:checked').each(function(){//lay ra nhung thang da chon
                console.log($(this))
                html += htmlItemListReceiverDialog($(this).data('name'), $(this).data('nickname'), true)//roi render, true la chon checked trong input
            })
            $('#list-receiver-dialog').html(html)
        }
        if (functionName){
            functionName().then(data=>{
                var checked = []
                //de ma khi chuyen tu option nay sang option khac 
                //nhung thang da checked ko bi mat check 
                $('.dialog__choose-item-input:checked').each(function(){
                    checked.push($(this).data('name'));
                })
                // console.log(checked, data)
                
                console.log(data, checked)

                html = data.map((user)=>{
                    //tra ve xem user nay da checked hay chua
                    
                    return htmlItemListReceiverDialog(user.username, user.nickname, function(){
                        var isHas = false;
                        checked.forEach((userChecked)=>{
                            
                            if (userChecked == user.username){
                                isHas = true;
                            }
                        })
                        return isHas;
                    }())
                        
                })
        
                $('#list-receiver-dialog').html(html)
            })
        }
    }
    function renderNumberUserChecked(){
        $('#count-user-checked').text(`Mời thêm bạn vào cuộc trò chuyện (${$('.dialog__choose-checked-item').length}) người`)
    }

    function renderUserChecked(array){
        var html = array.map((item)=>{
            return htmlItemUserChecked(item)
        })
        $('#user-choose').html(html);//inner html ra 
        renderNumberUserChecked()
    }
//---------------------------------------Function handle interface -------------------------------------------------
    function handleCloseDialog(){//Lay ra các chổ có thể tắt dialog 
        var closeElements = [$('.overlay'), $('.dialog__header-close'), $('#btn-cancel')]
        closeElements.forEach(function(item){
            item.click(function(){//lặp qua khi click vào thì alert lên thông báo
                swal({
                    title: "Xác nhận",
                    text: "Bạn có chắc muốn bỏ tạo nhóm này?",
                    // icon: "warning",
                    buttons: true,
                    // dangerMode: true,
                })
                .then((willDelete) => {//nếu click ok thì ẩn dialog đi
                    if (willDelete) {
                        $('#dialog').attr("hidden", "hidden")
                        $('.overlay').attr("hidden", "hidden")
                    } 
                });
            })
        })
    }    
    
    function handleChooseUser(){
        //su ly khi nhan vao dau X cua cac user dc chon
        $('.container-close').off().each(function(intex, item){
            $(this).click(function(){
                $(item).parent().parent().remove();
                //sau khi xoa thi phai untick cai phan o duoi
                //lay ra nhung o input
                $('.dialog__choose-item-input').each(function(){
                    if ($(this).data('name') == $(item).data('name')){//tim xem cai nao la cai vua remove
                        $(this).prop('checked', false);//roi untick no
                        renderNumberUserChecked()//sau do render lai
                    } 
                })
            })
        })
    }

    function handleClickCheckbox(){
        //lap qua nhung checkbox
        $('.dialog__choose-item-input').off().each(function(index, item){
            $(this).change(function(){ //khi click vao checkbox
                console.log("change")
                if ($(item).is(':checked')){//neu ma tick
                    //neu ma tick thi append html
                    //cua thang duoc tick do len tren
                    console.log($(item))
                    var html = htmlItemUserChecked($(item).data('name'))
                    $('#user-choose').append(html)//thi render ra o tren nhug user dc chon
                }else{//con neu untick thi remove no
                    $('.dialog__choose-checked-item').each(function(){
                        if ($(this).data('name') == $(item).data('name')){
                            $(this).remove();
                        }
                    })
                }
                handleChooseUser()//ham de su ly viec them hoac xoa 1 user vao muc create group
                renderNumberUserChecked()//dem so nguoi da chon

            })
        })
    }

    function handleSwitchOptionDialog(){
        //su ly khi thay doi giua cac option
        //lay nhung option
        $('.dialog__option-container').each(function(){
            $(this).click (function(){//khi cai nao dc click thi 
                //goi api va render ra cai do
                renderReceiversDialog($(this).data('option'))
                $('.dialog__choose-item-input').off().each(function(index, item){
                    $(this).change(function(){ //khi click vao checkbox
                        console.log("change")
                        if ($(item).is(':checked')){
                            //neu ma tick thi append html
                            //cua thang duoc tick do len tren
                            var html = htmlItemUserChecked($(item).data('name'))
                            $('#user-choose').append(html)
                        }else{//con neu untick thi remove no
                            $('.dialog__choose-checked-item').each(function(){
                                if ($(this).data('name') == $(item).data('name')){
                                    $(this).remove();
                                }
                            })
                        }
                        handleChooseUser()//ham de su ly viec them hoac xoa 1 user vao muc create group
                        renderNumberUserChecked()

                    })
                })
                //lap qua cac option go~ active
                $('.dialog__option-container').each(function(){
                    $(this).removeClass('active')
                })
                //roi them active nao thang nay
                $(this).addClass('active')
            })
        })
    }

    function handleDialog(){
        
        //Khi ma nhan tao group thi hien ban dialog len
        renderReceiversDialog("in_list")//render mac dinh la trong danh sach
        $('.create-group-chat').each(function(){
            //render ra 2 thang dau tien duoc chon
            $(this).click(function(index, btnCreateGroup){
                //hiện dialog lên
                $('#dialog').removeAttr("hidden")
                $('.overlay').removeAttr("hidden")

                var parentBtn = $(this).parent() //lay cai nay de lay name
                //2 thang dau tien la thang dc click va thang currentUser
                var firstChooseUser = [$('#username').text(), parentBtn.data('nickname')]
                renderUserChecked(firstChooseUser);

                $('.dialog__choose-item-input').each(function(){//va thang duoc click se dc tick
                    if ($(this).data('name') == parentBtn.data('name')){
                        $(this).prop('checked', true);
                    }
                })
                handleChooseUser()//ham de su ly viec them hoac xoa 1 user vao muc create group
                
                // // su ly khi click vao checkbox
                handleClickCheckbox()

                //su ly khi chon option
                handleSwitchOptionDialog()
            })
        })
        

        handleCloseDialog();
        
    }

    function scrollChatList(){
        var listMessageElement = document.querySelector('#list-message')
        listMessageElement.scrollTop = 9999999
    }

    function handleHoverListReceiver(){
        $('.list-chat-user-item').each(function(){
            $(this).mouseover(function(){//doi mau background
                $(this).removeClass('list-group-item-info').addClass('list-group-item-primary')
                $(this).css('cursor', 'pointer') //thay doi con chuot
            })
            $(this).mouseout(function(){
                $(this).removeClass('list-group-item-primary').addClass('list-group-item-info')
            })
            $(this).click(function(){
                //them active cho chinh thang do khi click vo no
                $('.list-chat-user-item').each(function(){
                    $(this).removeClass('active')
                })
                $(this).addClass('active')
                //thêm nữa là hiện cái container chat lên
                //đôi khi vừa ẩn xong nhấn qua cái khác
                $('.container-send-message').show()
            })
        })
    }

//---------------------------------------Function handle event -------------------------------------------------

//add a user to chat list
    function addChatList(){
        console.log('add chat list function')

        $('.add-chat-list').off().each(function(){
            $(this).click(function(){
                console.log("click");
                var data = {
                    receiver: $(this).parent().data('name'),
                    sender: $('#username').data('name'),
                    nicknameSender: $('#username').text(),
                    nicknameReceiver: $(this).parent().data('nickname'),
                }
                console.log(data)
                $.ajax({
                    url: '/add-chat-list',
                    method: 'POST',
                    data: data,
                    success: function(){
                    }
                })
            })
        })

    }
    //remove a user to chat list
    function hideChatList(){
        $('.hide-chat-list').off().each(function(){
            $(this).click(function(){
                var data = {
                    sender: $('#username').data('name'),
                    receiver: $(this).parent().data('name'),
                }
                $.ajax({
                    url: '/hide-chat-list',
                    method: 'POST', 
                    data: data,
                    success: function(){
                        $('#list-message').hide();
                        $('#list-message-hide').show();
                    }
                })
            })
        })
    }

    
    
    //hadle when hover and click to a user in chat list
    async function handleClickReceiver(){
        var listChatUserItem = document.querySelectorAll('.list-chat-user-item')

        listChatUserItem.forEach((item)=>{
            item.onclick = function(){
                //thay đổi url cho giống với thực tế để copy sẽ ra đúng trang đó
                window.history.pushState("", "", `/chat/${$(this).data('id')}`)
                //thay đổi attribuute data-idroom để mà sau này sẽ lấy cái data này 
                //gữi về cho server 
                $('#btn-send-message').attr('data-idroom', $(this).data('id'))
                renderMessage($(this).data('id'));
                $('#list-message').show();
                $('#list-message-hide').hide();
            }
        })
    }

    function activeCurrentReceiver(){
        var btnSendMessage = document.querySelector('#btn-send-message')
        $('.list-chat-user-item').each(function(){

            if ($(this).data('id') == btnSendMessage.getAttribute('data-idroom')){
                $(this).addClass("active")
            }
        })
    }

    //functuon sử lý khi chat
    function sendMessage(){
        $('#btn-send-message').click(function(){
            var sender
            var senderNickname = "??"
            var text = $('#input-send-message').val()
            var btnSendMessage = document.querySelector('#btn-send-message')
            //lấy ra username của người nhận message
            $('.list-chat-user-item').each(function(){
                if ($(this).data('id') == btnSendMessage.getAttribute('data-idroom')){
                    sender = $(this).data('name')
                    senderNickname = $(this).data('nickname')
                }
            })
            if (text){
                //emit tới server data của message
                $('#input-send-message').val('')
                socket.emit('sender send message', {
                    sender: $('#username').data('name'),
                    idroom: $('#btn-send-message').data('idroom'),
                    message: text
                })

                //còn phần này là hgọi ajax tới addChatList
                //để người gữi
                //tại cái này là add thằng gữi vào
                //list chat của thằng nhận nên receiver và sender ngược nhau 
                console.log('send message')
                var data = {
                    receiver: sender,
                    nicknameReceiver: senderNickname,
                    sender: $('#username').data("name"),
                    nicknameSender: $("#username").text()

                }
                console.log(data);
                $.ajax({
                    url: '/add-chat-list',
                    method: 'POST',
                    data: data,
                    success: function(){
                    }
                })
            }
        })
    }

    

    async function main(){
        scrollChatList() //scroll thanh chat xuong
        emitSocketIdOfCurrentUserToServer() 
        await renderAllUser() //block ben phai
        await renderReceivers() //block ben trai
        activeCurrentReceiver() //doi mau nguoi dang chat
        hideChatList() //su ly khi nhan vao Ẩn
        handleClickReceiver() //
        handleHoverListReceiver()
        addChatList() //su ly khi nhan vao them
        sendMessage() //sy ly khi gui tinh nhan
        handleDialog() //su ly khi nhan vao

        //
        $('#list-message-hide').hide() //
        $('#list-message-hide').removeAttr("hidden")
    }
    main()
    
    
//--------------------------------------On event from server-------------------------------------------------

    socket.on('changed', (data)=>{ // undefined
            
    })
    //nhận event new user rồi innerHTML vào thẻ UL
    socket.on('new user', (data)=>{ //{username, nickname}
        $('#list-total-user').append(html)
    })

    //lắng nghe event add 1 user vào chat list
    socket.on('sender add chat list', (data)=>{ //{receiver, id, nickname}
        console.log('sender add chat list 600')
        console.log(data)
        $('.list-chat-user-item').each(function(){
            if (data.receiver == $(this).data('name')){
                $(this).remove()//xoa den render cai moi
            }
        })
        console.log(data)
        var littleHtml = htmlItemListReceiver(data.receiver, data.nickname, data.id)
        var html = littleHtml.concat($('#list-chat-user').html())
        $('#list-chat-user').html(html)
        hideChatList()
        handleClickReceiver()
        handleHoverListReceiver()
        activeCurrentReceiver()
    })

    //lắng nghe event ẩn 1 user cột bên trái
    socket.on('sender remove chat list', (data)=>{
        $('#list-chat-user li span').each(function(index){
            if ($(this).text() === data.receiver){
                $(this).parent().remove()
                hideChatList()
                $('.container-send-message').hide()
                $('#list-message').html("");
            }    
        })
    })
    
    socket.on('server send message to sender', ({message, sender, idroom})=>{
        if ($("#btn-send-message").data('idroom') === idroom){
            var html = htmlItemListMessage(sender, message)
            $('#list-message').append(html)
            scrollChatList()
        }
    })

    socket.on('server send message to receiver', ({message, sender, idroom})=>{
        var btnSendMessage = document.querySelector("#btn-send-message")
        if (btnSendMessage.getAttribute('data-idroom') == idroom){
            var html = htmlItemListMessage(sender, message)
            $('#list-message').append(html)
            scrollChatList()
        }
    })
})