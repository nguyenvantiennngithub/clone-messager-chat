var socket = io();


function htmlItemTotalList(username, nickname){ //bên phải
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

function htmlItemChatList(receiver, sender){ //bên trái
    return `
         <li class="list-group-item list-group-item-success d-flex">
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

$(document).ready(()=>{

    //lấy list receiver ra de render
    axios.get('/api/user-chat-list')
    .then((response)=>{
        var html = response.data.map((user)=>{
            return htmlItemChatList(user.receiver, user.sender)
        })
        $('#list-chat-user').html(html)
    })  
    .catch((err)=>{
        throw err
    })
    //gọi api để lấy tất cả user để render ra HTML
    axios.get('/api/users') // [{nickname, username, socketid}, ....]
    .then((response)=>{
        
        var html = response.data.map((user) => {
            if (user.username != $('#username').text()){
                return htmlItemTotalList(user.username, user.nickname)
            }else{
                return;
            }
            
        });
        $('#list-total-user').html(html)

    //tránh lập code thì làm cái này 
    //cái này là code html của thẻ li của thẻ list có id là list-user-name
   

    socket.on('changed', (data)=>{ // undefined
            
    })
    //nhận event new user rồi innerHTML vào thẻ UL
    socket.on('new user', (data)=>{ //{username, nickname}
        var html = htmlItemTotalList(data.username, data.nickname)
        $('#list-total-user').append(html)
    })

    //lắng nghe event add 1 user vào chat list
    socket.on('sender add chat list', (data)=>{ //{receiver}
        var html = htmlItemChatList(data.receiver, data.sender)
        $('#list-chat-user').append(html)
        hideChatList()
    })

    //lắng nghe event có 1 user khác add mình vào chat list
    socket.on('receiver add chat list', (data)=>{ //{sender}
        var html = `<li class="list-group-item list-group-item-success">${data.sender}</i></li>`
        $('#list-chat-user').append(html)
    })

    //lắng nghe event ẩn 1 user cột bên trái
    socket.on('sender remove chat list', (data)=>{
        $('#list-chat-user li span').each(function(index){
            if ($(this).text() === data.receiver){
                $(this).parent().remove()
            }    
        })
    })
    // code bi loi
    // function hideChatList(){
    //     $('.hide-chat-list').each(function(index){
    //         $(this).click(()=>{
    //             console.log('click')
    //             var data = {
    //                 sender: $('#username').text(),
    //                 receiver: $($('.text-username-left')[index]).val(),
    //             }
    //             console.log(data)
    //             $.ajax({
    //                 url: '/hide-chat-list',
    //                 method: 'POST', 
    //                 data: data,
    //                 success: function(){
    //                     hideChatList()
    //                 }
    //             })
    //         })
    //     })
    // }


    function hideChatList(){
        var hideChatListElement = document.querySelectorAll('.hide-chat-list')
        hideChatListElement.forEach((item, index)=>{
            item.onclick = function(){
                console.log(item)
                var data = {
                    sender: $('#username').text(),
                    receiver: $($('.text-username-left')[index]).val(),
                }
                console.log(data)
                $.ajax({
                    url: '/hide-chat-list',
                    method: 'POST', 
                    data: data,
                    success: function(){
                        hideChatList()
                    }
                })
            }
        })
    }
    
   //Lấy user hiện tại
    axios.get('/api/user') //[{nickname, username, socketid}]
        .then((response)=>{
            socket.id = response.data[0].socketid
            socket.emit('change socket', socket.id)
        })
        .catch((err)=>{
            throw err
        })
        //sử lý thêm vào danh sách chát là cột bên trái
        //bắt sự kiện thêm 1 người vào chat list của mình
        $('.add-chat-list').each(function(index, value){ 
            $(this).click(()=>{
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
            })
        })

        // bắt sự kiện xóa 1 người ra khỏi chat list
        hideChatList()
    })
    .catch((error)=>{
        throw error
    })

})