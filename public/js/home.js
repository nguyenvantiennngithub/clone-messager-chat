
var socket = io();
//---------------------------------------Function store html code-------------------------------------------------
//code html render ra li ben phai
function htmlItemAllUser(username, nickname){ //bên phải
    return `
     <li class="list-group-item list-group-item-success d-flex">
         <span class="text-nickname" style="font-size: 24px">${nickname}</span>
         <div class="dropdown ml-auto">
             <button class="btn btn-secondary dropdown-toggle" type="button" id="right" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
             <div class="dropdown-menu" aria-labelledby="right" data-name="${username}" data-nickname="${nickname}">
                 <button class="add-chat-list dropdown-item" type="button">Thêm</button>
             </div>
         </div>
     </li>
`
}

function htmlItemGroup(name, idRoom){
    return `
    <li class="list-group-item list-group-item-success d-flex" data-idRoom=${idRoom}>
        <span class="text-nickname" style="font-size: 24px">${name}</span>
        <div class="dropdown ml-auto">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="right" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
            <div class="dropdown-menu" aria-labelledby="right">
                <button class="add-chat-list-group dropdown-item" type="button">Thêm</button>
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
             <div class="dropdown ml-auto">
                 <button class="btn btn-secondary dropdown-toggle" type="button" id="left" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                 <div class="dropdown-menu" aria-labelledby="left" data-name="${receiver}" data-nickname="${nickname}">
                    <button class="hide-chat-list dropdown-item" type="button">Ẩn</button>
                    <button class="create-group-chat dropdown-item" type="button">Tạo nhóm chat</button>
                    <button class="add-group-chat dropdown-item" type="button">Thêm thành viên</button>
                 </div>
             </div>
         </li>`

}

//code html render nhung la cho group ra li ben trai
function htmlItemListReceiverGroup(name, idRoom){ //bên trái
    return `
         <li class="list-chat-user-item list-group-item list-group-item-info d-flex" data-id="${idRoom}" data-nickname="${name}">
             <span class="text-nickname" style="font-size: 24px">${name}</span>
             <div class="dropdown ml-auto">
                 <button class="btn btn-secondary dropdown-toggle" type="button" id="left" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                 <div class="dropdown-menu" aria-labelledby="left" data-nickname="${name}">
                    <button class="hide-chat-list dropdown-item" type="button">Ẩn</button>
                 </div>
             </div>
         </li>
    `
}

//render message
function htmlItemListMessage(sender, message){
    //thay đổi style để dể nhìn người nhận người gữi
    // console.log($('#username').data('name'), sender)
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

//render ra danh sách để chọn ở dưới có checkbox
function htmlItemReceiverCreateGroup(name, nickname, isChecked){
    if (name != $('#username').text()){//khong render ra chin minh
        if (isChecked){
            return `
            <div class="dialog__choose-item">
                <input type="checkbox" name="" id="" class="dialog__choose-item-input" data-name="${name}" checked>
                <label class="dialog__choose-item-label">${nickname}</label>
            </div>
      `
        }
        return `
            <div class="dialog__choose-item">
                <input type="checkbox" name="" id="" class="dialog__choose-item-input" data-name="${name}">
                <label for="" class="dialog__choose-item-label">${nickname}</label>
            </div>
      `
    }
}

//render ra danh sách đã chọn ở trên ko có checkbox
function htmlItemCheckedCreateGroup(name, nickname){
    
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


function htmlItemCheckedAddGroup(name, idRoom){
    
    return `
        <div class="dialog__choose-checked-item group-selected" data-idroom="${idRoom}">
            <div class="fake-padding">
                <span class="dialog__choose-checked-item-name">${name}</span>
                <div class="container-close remove-group">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        </div>
    `
}

function htmlItemCheckboxAddGroup(name, idRoom, isDisable){
    if (isDisable){
        return `
        <div class="dialog__choose-item">
            <input type="checkbox" name="" id="" class="dialog__choose-item-input checkbox-select-group" data-idroom="${idRoom}" disabled>
            <label for="" class="dialog__choose-item-label">${name}</label>
        </div>
    `
    }
    return `
        <div class="dialog__choose-item">
            <input type="checkbox" name="" id="" class="dialog__choose-item-input checkbox-select-group" data-idroom="${idRoom}">
            <label for="" class="dialog__choose-item-label">${name}</label>
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

    //lay tat ca group cua currentUser
    async function getAllGroup(){
        return await axios.get('/api/groups')
        .then((response)=>{
            return response.data;
        })
    }

    //lay thong tin nhung user nam trong chat ist
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

    //lay thong tinh nhung cai group ma currentUser dang o
    async function getGroupInChatList(){
        return await axios.get('/api/group-chat-list')
        .then((response)=>{
            return response.data
        })
    }

    //lay tat ca group cua 1 user bat ky
    async function getGroupReceiver(receiver){
        return await axios.get(`/api/group-receiver/${receiver}`)
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
    //ở bên trái 
    //cai này bao gôm cả group và cá nhân
    async function renderReceivers(){
        //gọi api lấy danh sách những người đã add và có is_show = 1 ra
        //gồm có receiver và group
        var receivers = await getDataReceiver();
        var groups = await getGroupInChatList();
        //sau đó nối 2 cái này với nhau rồi sort theo thời gian 
        //để cái nào tương tác trước sẽ lên trước
        var result = receivers.concat(groups)
        console.log(result)
        //sort theo thoi gian tu gan nhat den xa nha
        result = result.sort((a, b)=>{ //sau đó sắp xếp theo thời gian
            //để người nào tương tác gần thì ở trên
            var aValue = new Date(a.updatedAt).getTime()//chuyen thoi gian sang number de so sanh
            var bValue = new Date(b.updatedAt).getTime()

            return bValue - aValue 
        })
        //render ra html      
        var html = result.map((user)=>{ //{sender, receiver, updatedAt, id}
            if (user.is_personal){//kiểm tra nếu personal thì reder theo personal
                return htmlItemListReceiver(user.username, user.nickname, user.id)
            }else{//còn group thì render theo group
                return htmlItemListReceiverGroup(user.name, user.id)
            }
        })
        //sau đó thì inner vào thẻ li
        $('#list-chat-user').html(html)      
        console.log("run here")
    }


    //call api get all user render html
    //ở bên phải
    //render ra tất cả các user đang có trừ curentUser
    function renderAllUser(){
        // [{nickname, username, socketid}, ....]
        getDataAllUser()
        .then((data)=>{
            var html = data.map((user) => {
                if (user.username != $('#username').data('name')){
                    return htmlItemAllUser(user.username, user.nickname)
                }else{
                    return;
                }
            })

            $('#list-total-user').html(html)
        })
    }

    //render tat ca cac group cot ben phai
    async function renderAllGroup(){
        var groups = await getAllGroup();
        var html = groups.map(group=>{
            return htmlItemGroup(group.name, group.id); 
        })
        $('#list-total-user').html(html)
        
    }
    //render ra tinh nhắn
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

    //render ra dạnh sách để chọn trong phần dialog
    //ở dưới. tuỳ vào cái option mà sẽ render ra những user
    //thỏa cái option đó
    async function renderReceiversCreateGroup(option){//ham render ra dialog tro chuyen gan day
        var functionName = ""
        var html = ""
        //kiem tra xem tuy` vao option ma ta lay data khac nhau
        if (option == "all"){//lay all
            functionName = getDataAllUser
        }else if (option == "in_list"){//lay trong list receiver
            functionName = getDataReceiver
        }else{ //thang nay la lay nhung thang da chon
            await $('.dialog__choose-item-input:checked').each(function(){//lay ra nhung thang da chon
                // console.log()
                html += htmlItemReceiverCreateGroup($(this).data('name'), $(this).siblings('label').text(), true)//roi render, true la chon checked trong input
            })
        }
        if (functionName){
            var users = await functionName();//lấy thông tinh theo cái option
            var userChecked = $('.dialog__choose-checked-item')//lấy ra những thằng đã chon
            if (userChecked.length == 0 ){
                userChecked = []
            }
            var html = users.map((user)=>{//lặp qua các cái thằng vừa lấy để render ra html
                //param thứ 3 là function return boolean xem là cái checkbox của thằng này có được
                //check hay ko, lấy ra những thằng đã chọn ở trên rồi làm nếu mà có thì check còn ko thì thôi
                return htmlItemReceiverCreateGroup(user.username, user.nickname, function(){
                    var isHas = false;
                    Array.from(userChecked).forEach((item)=>{
                        if ($(item).data('name') == user.username){
                            isHas = true;
                        }
                    })
                    return isHas;
                }())
            })
            
            
        }
        $('#list-receiver-dialog').html(html)
    }

    //render các checkbox group trong dialog add group
    async function renderGroupAddGroup(receiver){
        //lấy group của currentUser
        var groups = await getGroupInChatList();
        //lấy group của người cần add
        var groupReceiver = await getGroupReceiver(receiver);
        //lập qua lấy code html
        var html = groups.map((group)=>{
            return htmlItemCheckboxAddGroup(group.name, group.id, (
                //function dùng để disable cái checkbox mà receiver đã vô rồi
                ()=>{
                    var result = groupReceiver.some((grReceiver)=>{
                        return group.id === grReceiver.id
                    })
                    return result
                }
            )())

        })


        $('#listGroupAddGroup').html(html)
    }

    //render ra số lượng người đã đc check trong phần dialog
    function renderNumberUserChecked(){
        $('#count-user-checked').text(`Mời thêm bạn vào cuộc trò chuyện (${$('.dialog__choose-checked-item').length}) người`)
    }

    //render ra người dùng đã được chọn ở trên trong phần dialog
    function renderUserChecked(array){
        console.log(array)
        var html = array.map((item)=>{
            return htmlItemCheckedCreateGroup(item.name, item.nickname)
        })
        $('#user-choose').html(html);//inner html ra 
        renderNumberUserChecked()//thay đổi số lượng nên là phải render lại số lượng người đã chọn
    }

//---------------------------------------Function helper -------------------------------------------------

    function showListMessage(){
        $('#list-message').show();
        $('#list-message-hide').hide();
    }
        
    function hideListMessage(){
        $('#list-message').hide();
        $('#list-message-hide').show();
    }

    function showDialogCreateGroup(){
        $('#dialogCreateGroup').removeAttr("hidden")
        $('.overlay').removeAttr("hidden")
    }

    function hideDialogCreateGroup(){
        $('#dialogCreateGroup').attr("hidden", "hidden")
        $('.overlay').attr("hidden", "hidden")
    }


    function showDialogAddGroup(){
        $('#dialogAddGroup').removeAttr("hidden")
        $('.overlay').removeAttr("hidden")
    }

    function hideDialogAddGroup(){
        console.log($('#dialogAddGroup'))
        $('#dialogAddGroup').attr("hidden", "hidden")
        $('.overlay').attr("hidden", "hidden")
    }

    function getCurrentIdRoom(){
        var urlString = window.location.pathname;
        return urlString.split('/')[2]
    }

    function scrollChatList(){
        var listMessageElement = document.querySelector('#list-message')
        listMessageElement.scrollTop = 9999999
    }


//---------------------------------------Function Handle Dialog Create Group-------------------------------------------------
    //sử lý khi mà muốn tắt cái dialog này
    function handleCloseDialogCreateGroup(){//Lay ra các chổ có thể tắt dialog 
        //lấy ra những thằng có thể tắt được
        //1 là nhấn vào phần bên ngoài cái dialog là cái overlay
        //2 là nhấn và nút đóng ở góc trên bên phải
        //3 là nhấn vào nút hủy ở góc dưới bên phải
        var closeElements = [$('.overlay'), $('#headerIconCloseCreateGroup'), $('#btnCloseCreateGroup')]
        closeElements.forEach(function(btnCloseDialog){
            btnCloseDialog.click(function(){//lặp qua khi click vào thì alert lên thông báo
                console.log(btnCloseDialog)
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
                        hideDialogCreateGroup()
                    } 
                });
            })
        })
    }    

    //sử lý khi nhấn vào dấu X của cái danh sách người dùng được chọn ở tren
    function handleRemoveUserCheckedAboveCreateGroup(){
        //đầu tiên là lập qua các cái nút X
        //và khi cái nút X được click

        $('#user-choose').on('click', 'div div div.container-close', function(){
            //thì theo cấu trúc HTML thì phải lấy 2 thẻ cha nó thì 
            //mới lấy được cái thẻ ngoài cùng để xóa
            //thằng này là cái thẻ to nhất là cái item 1 block riêng của mổi thằng
            var chooseUserCheckedItem = $(this).parent().parent();
            chooseUserCheckedItem.remove();
            //lấy ra thằng có cái name ở dưới trùng với name thằng ở trên vừa xóa để uncheck nó
            $(`.dialog__choose-item-input[data-name=${chooseUserCheckedItem.data('name')}]`).prop('checked', false);
            renderNumberUserChecked()//sau do render lai số lượng userChecked

        })
    }

    //hàm sử lý khi click vào ô checkbox ở dưới
    function handleClickCheckboxBelowCreateGroup(){
        //su ly khi click vao div ở trong cái dialog khi tạo group 
        //lap qua nhung checkbox ở dưới
        //khi click vao checkbox
        $('#list-receiver-dialog').on('change', 'div input.dialog__choose-item-input', function(){
            var $currentInput = $(this)
            //kiểm tra nếu mà click vào là để check thì render ra thằng đó ở trên
            if ($currentInput.is(':checked')){//neu ma tick
                //neu ma tick thi append html
                //cua thang duoc tick do len tren
                var html = htmlItemCheckedCreateGroup($currentInput.data('name'), $currentInput.siblings('label').text())
                $('#user-choose').append(html)//thi render ra o tren nhug user dc chon
            }else{//con neu mà nó uncheck thi remove no
                //để mà remove thì phải lấy ra cái thằng mình vừa uncheck kếp hợp với
                //lặp qua mấy thằng ở trên để so sánh
                //theo cấu trúc HTML thì kế thẻ input có thẻ label lấy thẻ label để lấy tên của thẻ input đó
                $(`.dialog__choose-checked-item[data-name=${$currentInput.data('name')}`).remove()
            }
            //sau khi sử lý cái gì liên qua đến việc check hoặc uncheck thì đều phải render lại cái số lượng user checked
            renderNumberUserChecked() 
        })
    }
    
    //trong phần dialog sẽ có 3 cái option để mà chọn
    //để render ra phần ở dưới
    function handleSwitchOptionDialogCreateGroup(){
        //su ly khi thay doi giua cac option
        //lặp qua những cái option của nó
        $(`.filter-user-dialog`).each(function(index, btnOption){
            $(btnOption).click (function(){//khi cai nao dc click thi 
                //rồi cái nút option nào bị click thì sẽ lấy ra option của cái đó
                //hàm render này đc build sẵn chỉ cần bỏ option vào nó tự render 
                //ra líst HTML theo cái option đó
                renderReceiversCreateGroup($(btnOption).data('option'))
                
                //sau khi chọn thì thay đổi tí CSS cho cái option 
                //vừa được click xanh xanh lên tí cho nó khác bịt
                //lặp qua hết option xóa active hết
                $(`.filter-user-dialog`).each(function(){
                    $(this).removeClass('active')
                })
                //roi them active nao thằng vừa chộn
                $(btnOption).addClass('active')
            })
        })
    }

    //su ly chuyen che do personal or group bên phải
    function filterListTotalUser(){

        $(`.filter-list-total-user`).on('click', function(){
            $(`.filter-list-total-user.active`).removeClass('active');
            $(this).addClass('active')
            if ($(this).data('option') == 'personal'){
                renderAllUser();
            }else{
                renderAllGroup();
            }

        })
    }
//---------------------------------------Function Handle Dialog Add Group-------------------------------------------------
    //khi mà click vào checkbox trong dialog add group
    function handleChangeCheckboxAddGroup(){
        $('#listGroupAddGroup').on('change', 'div input.checkbox-select-group', function(){
            var nameGroup = $(this).siblings('label').text()
            var idRoom = $(this).data('idroom')
            if ($(this).is(':checked')){//nếu check thì append vào thằng đã chọn ở trên
                var html = htmlItemCheckedAddGroup(nameGroup, idRoom);
                $('#groupSelected').append(html);
            }else{//còn uncheck thì xóa thằng đã chọn ở trên
                $(`.group-selected[data-idroom=${idRoom}]`).remove()
            }
            countGroupAddGroup()//đếm lại số lượng group đã check
            checkBtnSubmitAddGroup()//check xem nếu mà có chọn ít nhất 1 group thì mới cho submit
        })
    }

    //khi mà nhấn dấu X ở trên trong dialog add group
    function removeGroupCheckedAddGroup(){
        $('#groupSelected').on('click', 'div div div.remove-group', function(){
            var containerTag = $(this).parent().parent();
            var idRoom = containerTag.data('idroom')
            //xóa cái thẻ li của cái vừa click vô dấu X
            containerTag.remove();
            //rồi uncheck cái checkbox ở dưới
            $(`.checkbox-select-group[data-idroom=${idRoom}]`).prop('checked', false);
            countGroupAddGroup()
            checkBtnSubmitAddGroup()
        })
    }

    //sử lý khi đóng cái dialog add group
    function closeDialogAddGroup(){
        //lấy ra những thằng để click vào để đóng dialog
        var array = [$('#btnCloseAddGroup'), $('.overlay'), $('#headerIconCloseAddGroup')]

        //lặp qua rồi khi click thì hiện alert 
        //rồi willDelete thì ẩn cái dialog đó
        array.forEach((item)=>{
            console.log(item)
            item.click(function(){
                swal({
                    title: "Xác nhận",
                    text: "Bạn có chắc muốn bỏ tạo nhóm này?",
                    // icon: "warning",
                    buttons: true,
                    // dangerMode: true,
                })
                .then((willDelete) => {//nếu click ok thì ẩn dialog đi
                    if (willDelete) {
                        console.log('hideAddGroup')
                        hideDialogAddGroup()
                    } 
                });
            })
        })
    }
    
    //đếm xem có bao nhiêu group đã đc chọn
    //rồi render ra text
    function countGroupAddGroup(){
        var length = $('.group-selected').length;
        var html = `Thêm vào nhóm (${length})`
        console.log($('#count-group-selected'))
        $('#count-group-selected').html(html)
    }

    //check xem là nếu mà chưa chọn gr nào hết
    //thì ko cho submit
    function checkBtnSubmitAddGroup(){
        var length = $('.group-selected').length;
        if (length > 0){
            $('#btnAddGroup').removeAttr('disabled', 'disabled')
        }else{
            $('#btnAddGroup').attr('disabled', 'disabled')
        }
    }


//---------------------------------------Function handle animation -------------------------------------------------
    //hadle when hover and click to a user in chat list
    async function handleClickReceiver(){
        $('#list-chat-user').on('click', 'li', function(){
            //thay đổi url cho giống với thực tế để copy sẽ ra đúng trang đó
            window.history.pushState("", "", `/chat/${$(this).data('id')}`)
            //thay đổi attribuute data-idroom để mà sau này sẽ lấy cái data này 
            //gữi về cho server 
            console.log("idRoom", $(this).data('id'))
            $('#btn-send-message').data('idroom', $(this).data('id'))
            // $('#btn-send-message').attr('data-idroom', $(this).data('id'))
            renderMessage($(this).data('id'));
            showListMessage()
        })
    }

    //thay đổi style màu bg cho thằng vừa tương tác
    function activeCurrentReceiver(){
        var $currentIdRoom = $('#btn-send-message').data('idroom')
        $('.list-chat-user-item.active').removeClass('active')//xóa hết mấy thằng có class active
        renderMessage($('#btn-send-message').data('idroom'))//render message của idRoom đó
        //cái thằng có data-id bằng với cái idRoom hiện tại 
        var $itemActive =  $(`.list-chat-user-item[data-id=${$currentIdRoom}]`)
        $itemActive.addClass('active')
        window.history.pushState("", "", `/chat/${$currentIdRoom}`)
    }
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
                $(this).addClass('active')
                //thêm nữa là hiện cái container chat lên
                //đôi khi vừa ẩn xong nhấn qua cái khác
                $('.container-send-message').show()
                console.log("SHOW")
            })
        })
    }

//---------------------------------------Function handle event -------------------------------------------------
    function createGroupChat(){
        //cái này là khi mà tạo bằng from 
        //khi click vào tạo
        $('#btn-create-group-chat').off().click(function(){
            var listNameUserChecked = [];
            //lấy ra tên của những thằng đã được chọn
            console.log('createGroupChat', $('.dialog__choose-checked-item'))
            $('.dialog__choose-checked-item').off().each(function(index, userCheckedItem){
                listNameUserChecked.push($(userCheckedItem).data('name'));
            })
            console.log(listNameUserChecked)
            //rồi gọi ajax về server sử lý
            $.ajax({
                url: '/create-group-chat',
                data: {
                    usernames: listNameUserChecked,
                    name: $('#name-group').val(),
                    
                },
                method: 'POST',
                success: function(){
                    ///xong thì đóng cái dialog lại
                    hideDialogCreateGroup()

                }
            })

            
        })
        
    }
    //add a user to chat list
    function addChatList(){
        $('#list-total-user').on('click', 'li div div button.add-chat-list', function(){
            var data = {//username của receiver và sender 
                receiver: $(this).parent().data('name'),
                sender: $('#username').data('name'),
            }
            console.log(data)
            //gọi ajax sau khi gọi ajax thì
            //server sẽ emit lên để mà render ra html
            //"sender add chat list" ở dưới cùng
            $.ajax({
                url: '/add-chat-list',
                method: 'POST',
                data: data,
                success: function(){
                }
            })
        })

        $('#list-total-user').on('click', 'li div div button.add-chat-list-group', function(){
            var idRoom = $(this).parent().parent().parent().data('idroom')
            var data = {
                idRoom
            }
            console.log(data);
            $.ajax({
                url: '/set-updatedAt-group-chat', 
                method: 'POST',
                data: data,
                success: function(){
                }
            })
        })
    }

  
    //remove a user chat list
    function hideChatList(){
        //lập qua những btn để ẩn chat list
        //khi click thì lấy gữi xuống server
        //data gồm useruser của sender và receiver 
        $('#list-chat-user').on('click', 'li div div button.hide-chat-list', function(){
            var data = {
                idRoom: $('#btn-send-message').data('idroom'),
            }
            //gọi ajax tới controller để sử lý 
            //sa khi sử lý xong thì server sẽ emit về
            //client "sender hide chat list"
            $.ajax({
                url: '/hide-chat-list',
                method: 'POST', 
                data: data,
                success: function(){
                }
            })
        })
    }

    //day la hàm chính để sử lý trong cái dialog
    function handleDialogCreateGroup(){
        
        //đầu tiên khi nhấn vào tạo group thì nó sẽ hiện lên cái dialog create group này
        //và trong cái dilog sẽ có 3 kiểu chọn để render ra cái phần để chọn người để thêm vào group
        //render mac dinh la trong danh sach đang chat (danh sách bên trái ở ngoài)
        //lập qua cái element tạo group
        renderReceiversCreateGroup("in_list");
        //sau khi cái tạo group được click thì
        $('#list-chat-user').on('click', 'li div div button.create-group-chat', async function(){
            var btnCreateGroupItem = $(this);
            $('.dialog__choose-item-input:checked').each(function(index, checkboxItem){
                if ($(btnCreateGroupItem) != $(checkboxItem).data('name') || $(btnCreateGroupItem) != $('#username').data('name')){
                    $(checkboxItem).prop('checked', false)
                }
            })
            await renderReceiversCreateGroup("in_list");

            //hiện dialog create group và cho thêm cái overlay bên ngoại hiện lên
            showDialogCreateGroup()
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
            renderUserChecked(dataOfUserChecked);

            //sau khi render ở tren thì cũng nên checked nó lun
            //do là thằng currentUser chắc chắn phải được chọn nên 
            //là ko render ra nó ở dưới nên cũng ko checked nó làm gì
            $('.dialog__choose-item-input').each(function(index, checkboxItem){

                if ($(checkboxItem).data('name') == $(btnCreateGroupItem).parent().data('name')){
                    $(checkboxItem).prop('checked', true);
                }
            })
            
           

        })
         // // su ly khi click vao checkbox
         handleClickCheckboxBelowCreateGroup()

        //su ly khi chon option
        handleSwitchOptionDialogCreateGroup()

        handleRemoveUserCheckedAboveCreateGroup()//ham de su ly viec them hoac xoa 1 user vao muc create group
        handleCloseDialogCreateGroup();
    }

    //hàm chính sử lý dialog add group
    async function handleDialogAddGroup(){
        countGroupAddGroup()//đếm số lượng gr đã chọn
        checkBtnSubmitAddGroup()///check xem là có thể submit ko
        handleChangeCheckboxAddGroup();//sử lý khi click vào checkbox ở dưới
        removeGroupCheckedAddGroup();//sử lý khi nhấn vào dấu X ở trên
        closeDialogAddGroup();//sửu lý khi đóng dialog 
        $('#list-chat-user').on ('click', 'li div div button.add-group-chat', async function(){
            showDialogAddGroup();//khi click vào thêm vào nhóm thì hiển thị cái dialog ra
            await renderGroupAddGroup(userAdd);//sau đó render ra cái checkbox ở dưới

            //lấy ra username của receiver và số lượng group đã chọn
            var containerTag = $(this).parent().parent().parent()
            var userAdd = containerTag.data('name')
            console.log(containerTag)
            var idRooms = [];
            
            $('#btnAddGroup').on('click', function(){
                $('.group-selected').each(function(){
                    idRooms.push($(this).data('idroom'))
                })

                var data = {
                    userAdd,
                    idRooms: idRooms
                }
                console.log(data)
                //sau đó gọi ajax xuống backed sử lý
                $.ajax({
                    url: '/add-group-chat', 
                    method: 'POST',
                    data: data,
                    success: function(){
                        //sau khi xong thì đóng dialog
                        hideDialogAddGroup()
                    }
                })
            })

           


        })
    }

    
    

    //functuon sử lý khi chat
    function sendMessage(){
        $('#btn-send-message').on('click', function(){
            var sender
            var text = $('#input-send-message').val()
            //lấy ra username của người nhận message
            //lấy thằng có class đó và có data-id == idRoom hiện tại rồi lấy ra name của nó
            sender = $(`.list-chat-user-item[data-id=${$('#btn-send-message').data('idroom')}]`).data('name')
           
            console.log(sender)
            if (text){
                //emit tới server data của message
                var dataMessage = {
                    sender: $('#username').data('name'),
                    idRoom: $('#btn-send-message').data('idroom'),
                    message: text
                }
                $('#input-send-message').val('')
                socket.emit('sender send message', dataMessage)

                //nếu là personal
                if (sender){
                    // còn phần này là hgọi ajax tới addChatList
                    // để người gữi
                    // tại cái này là add thằng gữi vào
                    // list chat của thằng nhận nên receiver và sender ngược nhau 
                    var data = {
                        receiver: sender,
                        sender: $('#username').data("name"),
                        
                    }
                    $.ajax({
                        url: '/add-chat-list',
                        method: 'POST',
                        data: data,
                        success: function(){
                        }
                    })
                    //cái này là group
                }else if (!sender){
                    var data = {
                        idRoom: $('#btn-send-message').data('idroom'),
                    }
                    $.ajax({
                        url: '/set-updatedAt-group-chat', 
                        method: 'POST',
                        data: data,
                        success: function(){
                        }
                    })
                }
                
            }
        })
    }

    
    //hàm chính để sử lý
    async function main(){
        scrollChatList() //scroll thanh chat xuong
        emitSocketIdOfCurrentUserToServer() 
        renderAllUser() //block ben phai
        await renderReceivers() //block ben trai

        activeCurrentReceiver() //doi mau nguoi dang chat
        handleClickReceiver() //
        handleHoverListReceiver()


        hideChatList() //su ly khi nhan vao Ẩn
        addChatList() //su ly khi nhan vao them
        sendMessage() //sy ly khi gui tinh nhan
        handleDialogCreateGroup() //su ly khi nhan vao
        handleDialogAddGroup()
        createGroupChat()//tạo group chat
        filterListTotalUser()
        //

        showListMessage()
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
    socket.on('add chat list personal', function ({receiver, id, nickname, isActive}){ //{receiver, id, nickname, isActive}
        console.log('sender add chat list', {receiver, id, nickname, isActive})
        //remove thang receiver sau do render lai
        $(`.list-chat-user-item[data-id=${id}]`).remove();
        if (isActive){
            console.log('change idRoom')
            $('#btn-send-message').data('idroom', id)
            // renderMessage(id);
            showListMessage()
            // $('.list-chat-user-item.active').removeClass('active')
        }
       

        var littleHtml = htmlItemListReceiver(receiver, nickname, id)
        var html = littleHtml.concat($('#list-chat-user').html())
        $('#list-chat-user').html(html)
        
        // $(`.list-chat-user-item[data-name="${data.receiver}"]`).addClass('active');
        
        handleHoverListReceiver()
        activeCurrentReceiver()
        $('.container-send-message').show()
        
    })

    //lắng nghe event ẩn 1 user cột bên trái
    socket.on('hide chat list', ({idRoom})=>{
        $(`.list-chat-user-item[data-id=${idRoom}]`).remove();
        $('.container-send-message').hide()
        $('#list-message').html("");
        hideListMessage()
    })

    //khi mà sender send message thì sẽ hiện lên trên màng hình của sender
    socket.on('server send message', ({message, sender, idroom})=>{
        console.log("socket/sendMessage",sender, $('#username').data('name'))
        if ($("#btn-send-message").data('idroom') === idroom){
            var html = htmlItemListMessage(sender, message)
            $('#list-message').append(html)
            scrollChatList()
        }
    })

    //add chat list khi nó là group
    socket.on('add chat list group', ({groupName, idRoom, isActive})=>{
        //nếu mà có sẳn cái group đó rồi thì xóa group đó đi //tí sẽ render lại
        $(`.list-chat-user-item[data-id=${idRoom}]`).remove();
        console.log('senderCreateGroup/home', {groupName, idRoom, isActive})

        //sau đó lấy html của cái group đó rồi render lại
        var html = htmlItemListReceiverGroup(groupName, idRoom);
        //mục đích là cho nó lên đầu
        html += $('#list-chat-user').html()        
        $('#list-chat-user').html(html);

        //nếu mà có active thì set lại cái idRoom và show đúng mesage của room đó
        if (isActive){
            $('#btn-send-message').data('idroom', idRoom)
            // renderMessage(id);
            showListMessage()
        }
        activeCurrentReceiver()
        handleHoverListReceiver()
        $('.container-send-message').show()
    })
})

