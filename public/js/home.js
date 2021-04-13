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
                <input type="checkbox" name="" id="${name}" class="dialog__choose-item-input" data-name="${name}" checked>
                <label for="${name}" class="dialog__choose-item-label">${nickname}</label>
            </div>
      `
        }
        return `
            <div class="dialog__choose-item">
                <input type="checkbox" name="" id="${name}" class="dialog__choose-item-input" data-name="${name}">
                <label for="${name}" class="dialog__choose-item-label">${nickname}</label>
            </div>
      `
    }
}

function htmlItemUserChecked(name, nickname){
    if (name === $('#username').data('name')){//khong render dau X
        return `
        <div class="dialog__choose-checked-item" data-name="${name}">
            <div class="fake-padding">
                <span class="dialog__choose-checked-item-name">${nickname}</span>
            </div>
        </div>
    `
    }
    return `
        <div class="dialog__choose-checked-item" data-name="${name}">
            <div class="fake-padding">
                <span class="dialog__choose-checked-item-name">${nickname}</span>
                <div class="container-close">
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

    async function renderReceiversDialog(option){//ham render ra dialog tro chuyen gan day
        var functionName = ""
        var html = ""
        //kiem tra xem tuy` vao option ma ta lay data khac nhau
        if (option == "all"){//lay all
            functionName = getDataAllUser
        }else if (option == "in_list"){//lay trong list receiver
            functionName = getDataReceiver
        }else{ //thang nay la lay nhung thang da chon
            await $('.dialog__choose-item-input:checked').each(function(){//lay ra nhung thang da chon
                console.log($(this))
                html += htmlItemListReceiverDialog($(this).data('name'), $(this).data('nickname'), true)//roi render, true la chon checked trong input
            })
        }
        if (functionName){
            await functionName().then(data=>{
                var checked = []
                //de ma khi chuyen tu option nay sang option khac 
                //nhung thang da checked ko bi mat check 
                $('.dialog__choose-item-input:checked').each(function(){
                    checked.push($(this).data('name'));
                })
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
                console.log(html)
            })
        }
        $('#list-receiver-dialog').html(html)
    }
    function renderNumberUserChecked(){
        $('#count-user-checked').text(`Mời thêm bạn vào cuộc trò chuyện (${$('.dialog__choose-checked-item').length}) người`)
    }

    function renderUserChecked(array){
        var html = array.map((item)=>{
            return htmlItemUserChecked(item.name, item.nickname)
        })
        $('#user-choose').html(html);//inner html ra 
        renderNumberUserChecked()
    }
//---------------------------------------Function Handle Dialog -------------------------------------------------
    //sử lý khi mà muốn tắt cái dialog này
    function handleCloseDialog(){//Lay ra các chổ có thể tắt dialog 
        //lấy ra những thằng có thể tắt được
        //1 là nhấn vào phần bên ngoài cái dialog là cái overlay
        //2 là nhấn và nút đóng ở góc trên bên phải
        //3 là nhấn vào nút hủy ở góc dưới bên phải
        var closeElements = [$('.overlay'), $('.dialog__header-close'), $('#btn-cancel')]
        closeElements.forEach(function(btnCloseDialog){
            btnCloseDialog.click(function(){//lặp qua khi click vào thì alert lên thông báo
                //sau khi click thì gọi thư viện sử lý hộ
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

    //sử lý khi nhấn vào dấu X của cái danh sách người dùng được chọn ở tren
    function handleRemoveUserCheckedAbove(){
        //đầu tiên là lập qua các cái nút X
        $('.container-close').off().each(function(index, btnCloseItem){
            //và khi cái nút X được click
            $(btnCloseItem).click(function(){
                //thì theo cấu trúc HTML thì phải lấy 2 thẻ cha nó thì 
                //mới lấy được cái thẻ ngoài cùng để xóa
                //thằng này là cái thẻ to nhất là cái item 1 block riêng của mổi thằng
                var chooseUserCheckedItem = $(btnCloseItem).parent().parent();
                chooseUserCheckedItem.remove();
                //sau khi xóa xong thì phải uncheck danh sách ở dưới

                //đầu tiên là lập qua các cái checkbox ở dưới
                $('.dialog__choose-item-input').each(function(index, checkboxItem){
                    //theo cấu trúc HTML thì kế thẻ input có thẻ label lấy thẻ label để lấy tên của thẻ input đó
                    
                    if ($(this).data('name') == chooseUserCheckedItem.data('name')){//tim xem cai nao la cai vua remove
                        $(this).prop('checked', false);//roi untick no
                        renderNumberUserChecked()//sau do render lai số lượng userChecked
                    } 
                })
            })
        })
    }

    //hàm sử lý khi click vào ô checkbox ở dưới
    function handleClickCheckboxBelow(){
        //su ly khi click vao div ở trong cái dialog khi tạo group 
        //lap qua nhung checkbox ở dưới
        $('.dialog__choose-item-input').off().each(function(index, checkboxItem){
            //bắt sự kiên khi nó thay đổi là click vào
            $(checkboxItem).change(function(){ //khi click vao checkbox
                console.log("change")
                //kiểm tra nếu mà click vào là để check thì render ra thằng đó ở trên
                if ($(checkboxItem).is(':checked')){//neu ma tick
                    //neu ma tick thi append html
                    //cua thang duoc tick do len tren
                    var html = htmlItemUserChecked($(checkboxItem).data('name'), $(checkboxItem).siblings('label').text())
                    $('#user-choose').append(html)//thi render ra o tren nhug user dc chon
                }else{//con neu mà nó uncheck thi remove no
                    //để mà remove thì phải lấy ra cái thằng mình vừa uncheck kếp hợp với
                    //lặp qua mấy thằng ở trên để so sánh
                    //theo cấu trúc HTML thì kế thẻ input có thẻ label lấy thẻ label để lấy tên của thẻ input đó
                    $('.dialog__choose-checked-item').each(function(index, userCheckedItem){
                        console.log($(userCheckedItem).data('name'))
                        
                        if ($(userCheckedItem).data('name') == $(checkboxItem).data('name')){//sau khi tìm ra
                            $(userCheckedItem).remove();//thì remove nó 
                        }
                    })
                }
                //vì là mình đã xóa 1 thằng trong cái list các user đã checked ở trên nên mình phải
                //chạy lại hàm này để nó đọc lại cấu trúc
                handleRemoveUserCheckedAbove()
                //sau khi sử lý cái gì liên qua đến việc check hoặc uncheck thì đều phải render lại cái số lượng user checked
                renderNumberUserChecked() 

            })
        })
    }
    
    //trong phần dialog sẽ có 3 cái option để mà chọn
    //để render ra phần ở dưới
    function handleSwitchOptionDialog(){
        //su ly khi thay doi giua cac option
        //lặp qua những cái option của nó
        $('.dialog__option-container').each(function(index, btnOption){
            $(btnOption).click (function(){//khi cai nao dc click thi 
                //rồi cái nút option nào bị click thì sẽ lấy ra option của cái đó
                //hàm render này đc build sẵn chỉ cần bỏ option vào nó tự render 
                //ra líst HTML theo cái option đó
                renderReceiversDialog($(btnOption).data('option'))

                
                //sau khi chọn thì thay đổi tí CSS cho cái option 
                //vừa được click xanh xanh lên tí cho nó khác bịt
                //lặp qua hết option xóa active hết
                $('.dialog__option-container').each(function(){
                    $(this).removeClass('active')
                })
                //roi them active nao thằng vừa chộn
                $(btnOption).addClass('active')
            })
        })
    }

   
    //day la hàm chính để sử lý trong cái dialog
    function handleDialog(){
        
        //đầu tiên khi nhấn vào tạo group thì nó sẽ hiện lên cái dialog create group này
        //và trong cái dilog sẽ có 3 kiểu chọn để render ra cái phần để chọn người để thêm vào group
        //render mac dinh la trong danh sach đang chat (danh sách bên trái ở ngoài)
        //lập qua cái element tạo group
        $('.create-group-chat').each(function(index, btnCreateGroupItem){
            //sau khi cái tạo group được click thì
            $(btnCreateGroupItem).click(async function(){
                await renderReceiversDialog("in_list");

                //hiện dialog create group và cho thêm cái overlay bên ngoại hiện lên
                $('#dialog').removeAttr("hidden")
                $('.overlay').removeAttr("hidden")
                var parentOfBtnCreateGroup = $(btnCreateGroupItem).parent()
                //Sau đó sẽ có 2 thằng đầu tiên được auto chọn là
                //thằng currentUser và thằng được click theo thứ tự ở dưới
                var dataOfUserChecked = [
                    {
                        nickname: $('#username').text(),
                        name: $('#username').data('name'),
                    }, 
                    {
                        nickname: parentOfBtnCreateGroup.data('nickname'),
                        name: parentOfBtnCreateGroup.data('name'),
                    }
                ]
                // var dataOfUserChecked = [$('#username').text(), parentOfBtnCreateGroup.data('nickname')]
                // và render ra 2 thằng này ở phần userChecked
                $('.dialog__choose-item-input:checked').each(function(index, checkboxCheckedItem){
                    var name = $(checkboxCheckedItem).data('name');
                    var nickname = $(checkboxCheckedItem).siblings('label').text();
                    dataOfUserChecked.push({name, nickname})
                })
                renderUserChecked(dataOfUserChecked);

                //sau khi render ở tren thì cũng nên checked nó lun
                //do là thằng currentUser chắc chắn phải được chọn nên 
                //là ko render ra nó ở dưới nên cũng ko checked nó làm gì
                $('.dialog__choose-item-input').each(function(index, checkboxItem){


                    if ($(checkboxItem).data('name') == $(btnCreateGroupItem).parent().data('name')){
                        $(checkboxItem).prop('checked', true);
                    }
                })
                handleRemoveUserCheckedAbove()//ham de su ly viec them hoac xoa 1 user vao muc create group
                
                // // su ly khi click vao checkbox
                handleClickCheckboxBelow()

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
//---------------------------------------Function handle animation -------------------------------------------------
    //hàm làm đẹp sử lý khi hover vào item của list receiver thì đổi màu tí
    //và đổi con chuột sang poiter và đổi màu thằng đang chọn cho nó khác biệt
    function handleHoverListReceiver(){
        $('.list-chat-user-item').each(function(index, receiverItem){
            $(receiverItem).mouseover(function(){//doi mau background
                $(receiverItem).removeClass('list-group-item-info').addClass('list-group-item-primary')
                $(receiverItem).css('cursor', 'pointer') //thay doi con chuot
            })
            $(receiverItem).mouseout(function(){
                $(receiverItem).removeClass('list-group-item-primary').addClass('list-group-item-info')
            })
            $(receiverItem).click(function(){
                //them active cho chinh thang do khi click vo no
                $('.list-chat-user-item').each(function(){
                    $(this).removeClass('active')
                })
                $(receiverItem).addClass('active')
                //thêm nữa là hiện cái container chat lên
                //đôi khi vừa ẩn xong nhấn qua cái khác
                $('.container-send-message').show()
            })
        })
    }

    

    async function main(){
        scrollChatList() //scroll thanh chat xuong
        emitSocketIdOfCurrentUserToServer() 
        renderAllUser() //block ben phai
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