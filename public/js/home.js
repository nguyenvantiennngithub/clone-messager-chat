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
             <div class="dropdown-menu" aria-labelledby="right" >
                 <button class="add-chat-list dropdown-item" type="button">Thêm</button>
             </div>
         </div>
     </li>
`
}

//code html render ra li ben trai
function htmlItemListReceiver(receiver, id){ //bên trái
    return `
         <li class="list-chat-user-item list-group-item list-group-item-info d-flex" data-name=${receiver} data-id=${id}>
             <span class="text-nickname" style="font-size: 24px">${receiver}</span>
             <input class="text-username-left" value="${receiver}" hidden>
             <div class="dropdown ml-auto">
                 <button class="btn btn-secondary dropdown-toggle" type="button" id="left" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                 <div class="dropdown-menu" aria-labelledby="left">
                     <button class="hide-chat-list dropdown-item" type="button">Ẩn</button>
                 </div>
             </div>
         </li>`
}

//render message
function htmlItemListMessage(sender, message){
    
    if ($('#username').text() !== sender){
        return `
            <li class="list-group-item list-group-item-secondary list-group-message message-item" style="margin-right: auto">${message}</li>
        `
    }else{
        return `
            <li class="list-group-item list-group-item-success list-group-message message-item" style="margin-left: auto">${message}</li>
        `
    }
    
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
    async function getDataUsersInChatList(){
        return await axios.get('/api/user-chat-list')
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
    async function renderChatList(){
        await getDataUsersInChatList()
        .then((data)=>{ //{sender, receiver, updatedAt, id}
            //sort theo thoi gian
            var userSort = data.sort((a, b)=>{
                var aValue = new Date(a.updatedAt).getTime()//chuyen thoi gian sang number de so sanh
                var bValue = new Date(b.updatedAt).getTime()

                return bValue - aValue 
            })        

            //render ra html            
            var html = userSort.map((user)=>{ //{sender, receiver, updatedAt, id}
                return htmlItemListReceiver(user.username, user.id)
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
        })
    }
//---------------------------------------Function ajax -------------------------------------------------


//---------------------------------------Function handle event -------------------------------------------------

    //add a user to chat list
    function addChatList(){
        var addChatListElement = document.querySelectorAll('.add-chat-list')
        addChatListElement.forEach((item, index)=>{
            item.onclick = function(){
                // console.log('click')
                var data = {
                    receiver: $($('.text-username-right')[index]).val(),
                    sender: $('#username').text()
                }
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
    //remove a user to chat list
    function hideChatList(){
        var hideChatListElement = document.querySelectorAll('.hide-chat-list')
        hideChatListElement.forEach((item, index)=>{
            item.onclick = function(){
                var data = {
                    sender: $('#username').text(),
                    receiver: $($('.text-username-left')[index]).val(),
                }
                $.ajax({
                    url: '/hide-chat-list',
                    method: 'POST', 
                    data: data,
                    success: function(){
                        
                    }
                })
            }
        })
    }
    
    
    //hadle when hover and click to a user in chat list
    function chooseReceiver(){
        // console.log($('.list-chat-user-item'))
        //animation when infocus and outfocus
        $('.list-chat-user-item').each(function(){
            $(this).mouseover(function(){
                $(this).removeClass('list-group-item-info').addClass('list-group-item-primary')
                $(this).css('cursor', 'pointer')
            })
            $(this).mouseout(function(){
                $(this).removeClass('list-group-item-primary').addClass('list-group-item-info')
            })
            $(this).click(function(){
                //thay đổi url cho giống với thực tế để copy sẽ ra đúng trang đó
                window.history.pushState("", "", `/chat/${$(this).data('id')}`)
                //thay đổi attribuute data-idroom để mà sau này sẽ lấy cái data này 
                //gữi về cho server 
                $('#btn-send-message').attr('data-idroom', $(this).data('id'))
                renderMessage($(this).data('id'))
            })
        })
    }

    //functuon sử lý khi chat
    function sendMessage(){
        $('#btn-send-message').click(function(){
            var sender
            var text = $('#input-send-message').val()
            var btnSendMessage = document.querySelector('#btn-send-message')
            //lấy ra username của người nhận message
            $('.list-chat-user-item').each(function(){
                if ($(this).data('id') == btnSendMessage.getAttribute('data-idroom')){
                    sender = $(this).data('name')
                }
            })

            if (text){
                //emit tới server data của message
                $('#input-send-message').val('')
                socket.emit('sender send message', {
                    sender: $('#username').text(),
                    idroom: $('#btn-send-message').data('idroom'),
                    message: text
                })

                //còn phần này là hgọi ajax tới addChatList
                //để người gữi
                //tại cái này là add thằng gữi vào
                //list chat của thằng nhận nên receiver và sender ngược nhau 
                var data = {
                    receiver: sender,
                    sender: $('#username').text()
                }
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
        var listMessageElement = document.querySelector('#list-message')
        listMessageElement.scrollTop = 9999
        emitSocketIdOfCurrentUserToServer()
        await renderAllUser()
        await renderChatList()
        chooseReceiver()
        addChatList()
        hideChatList()
        sendMessage()
        
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
    socket.on('sender add chat list', (data)=>{ //{receiver, id}
        console.log('sender add chat list')
        $('.list-chat-user-item').each(function(){
            if (data.receiver == $(this).data('name')){
                $(this).remove()
            }
        })

        var littleHtml = htmlItemListReceiver(data.receiver, data.id)
        var html = littleHtml.concat($('#list-chat-user').html())
        $('#list-chat-user').html(html)
        hideChatList()
        chooseReceiver()

    })

    //lắng nghe event ẩn 1 user cột bên trái
    socket.on('sender remove chat list', (data)=>{
        $('#list-chat-user li span').each(function(index){
            if ($(this).text() === data.receiver){
                $(this).parent().remove()
                hideChatList()
            }    
        })
    })
    
    socket.on('server send message to sender', ({message, sender, idroom})=>{
        if ($("#btn-send-message").data('idroom') === idroom){
            var html = htmlItemListMessage(sender, message)
            $('#list-message').append(html)
        }
    })
    socket.on('server send message to receiver', ({message, idroom})=>{
        var btnSendMessage = document.querySelector("#btn-send-message")
        if (btnSendMessage.getAttribute('data-idroom') == idroom){
            var html = htmlItemListMessage($('#username'), message)
            $('#list-message').append(html)
        }
    })

})