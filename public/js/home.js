
var socket = io();
//============================================================================================================
//---------------------------------------Function store html code-------------------------------------------------
//============================================================================================================

//code html render ra li ben phai cho user
function htmlTotalUser(username, nickname){ //bên phải
    return `
     <li class="list-group-item list-group-item-success d-flex" data-name="${username}">
         <span class="text-nickname" style="font-size: 24px">${nickname}</span>
         <div class="dropdown ml-auto">
             <button class="btn btn-secondary dropdown-toggle" type="button" id="right" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
             <div class="dropdown-menu" aria-labelledby="right" data-nickname="${nickname}">
                 <button class="add-chat-list dropdown-item" type="button">Thêm</button>
             </div>
         </div>
     </li>
`
}
//html render li ben phai cho group
function htmlToTalGroup(name, idRoom){
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

//code html render ra li ben trai cho user
function htmlCheckedUser(receiver, nickname, id){ //bên trái
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

//render thẻ li bên trái cho group
function htmlCheckedGroup(name, idRoom){ //bên trái
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
async function htmlMessage(sender, message){
    //thay đổi style để dể nhìn người nhận người gữi
    // console.log($('#username').data('name'), sender)
    var {username} = await getCurrentUser();
    if (username !== sender){
        return `
            <li class="list-group-item list-group-item-secondary list-group-message message-item" style="margin-right: auto">${message}</li>
        `
    }else{
        return `
            <li class="list-group-item list-group-item-success list-group-message message-item" style="margin-left: auto">${message}</li>
        `
    }
}


//render item cho user ở dưới trong dialog craete group
async function htmlUserDialog(name, nickname, isChecked){
    var {username} = await getCurrentUser();
    if (name != username){//khong render ra chin minh
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

//render ra user đã chọn ở trên dialog create group
async function htmlCheckedUserDialog(name, nickname){
    var {username} = await getCurrentUser();
    
    if (name === username){//khong render dau X
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


function htmlGroupCheckedAddGroup(idRoom, name){
    
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

function htmlGroupAddGroup(name, idRoom, isDisable){
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
function htmlThreadChatPersonal(name){
    return `
        <h3 id="name-room">
            <span>${name}</span>
            <span id="edit-name" class="edit-name">
                <i class="fas fa-user-edit"></i>
            </span>
        </h3>

        <div id="container-change-name" hidden>
            <input type="text" id="input-change-name" class="input-change-text">
            <span id="submit-change-name">
                <i class="fas fa-check"></i>
            </span>
        </div>  
    `
}

function htmlThreadChatGroup(name, count){
    return `
        <h3 id="name-room">
            <span>${name}</span>
            <span id="edit-name" class="edit-name">
                <i class="fas fa-user-edit"></i>
            </span>
        </h3>
        <div id="container-change-name" hidden>
            <input type="text" id="input-change-name" class="input-change-text">
            <span id="submit-change-name">
                <i class="fas fa-check"></i>
            </span>
        </div>   

        <span>${count} thành viên</span>
         `
}

function htmlInputChangeName(){
    return `
        <div id="input-change-name">
            <input type="text" class="input-change-text">
            <span id="submit-change-name">
                <i class="fas fa-check"></i>
            </span>
        </div>  
    `

}

//render message
async function htmlMessageCantFind(){
    //thay đổi style để dể nhìn người nhận người gữi
    return `<li class="list-group-item list-group-item-danger list-group-message message-item"
    style="margin-left:auto; margin-right: auto">Không thể tìm thấy</li>`
}


//============================================================================================================
//---------------------------------------Function render html-------------------------------------------------
//============================================================================================================
   
//render ra cả user và group bên trái
async function renderCheckedUserAndGroup(){
    //lấy user và group đã được check
    var checkedUsers = await getCheckedUser();
    var checkedGroups = await getCheckedGroup();
    var result = checkedUsers.concat(checkedGroups);

    //concat và sort theo updatedAt lại
    result = sortByUpdatedAt(result)
    // console.log(result)
    
    //render ra html 
    var html = result.map((user)=>{ //{sender, receiver, updatedAt, id}
        if (user.is_personal){//kiểm tra nếu personal thì reder theo personal
            return htmlCheckedUser(user.username, user.nickname, user.id)
        }else{//còn group thì render theo group
            return htmlCheckedGroup(user.name, user.id)
        }
    })
    //sau đó thì inner vào thẻ ul
    $('#list-chat-user').html(html)      
}


//render ra user bên phải
async function renderTotalUser(){
    // [{nickname, username, socketid}, ....]
    var totalUsers = await getTotalUser();
    var currentUser = await getCheckedUser();
    totalUsers = totalUsers.filter((user)=>{
        return user.username != currentUser.username
    })
    var html = totalUsers.map((user) => {
        return htmlTotalUser(user.username, user.nickname)
    })
    $('#list-total-user').html(html)
}

//render tat ca cac group cot ben phai
async function renderTotalGroup(){
    var groups = await getTotalGroup();
    var html = groups.map(group=>{
        return htmlToTalGroup(group.name, group.id); 
    })
    // console.log("renderTotalGroup", html)
    $('#list-total-user').html(html)
}



//render ra tinh nhắn
async function renderMessage(idRoom){
    var messages = await getMessage(idRoom)
    // console.log("start")
    var promises = messages.map((message)=>{
        return htmlMessage(message.sender, message.message)
    })
    var html = await Promise.all(promises)
    $('#list-message').html(html)
    scrollChatList()
}


//render list ở dưới của dialog create group
async function renderReceiversCreateGroupByOption(option){
    console.log('render')
    var data = ""
    var html = ""
    var isChecked;
    //kiem tra xem tuy` vao option ma ta lay data khac nhau
    var data = await getUserByOptionCreateGroup(option)
    // console.log(data)
    //lấy danh sách những thằng đã được check để
    //render nếu option là checked 
    var listUserChecked = getUserCheckedByCheckboxCreateGroup()
    
    console.log(listUserChecked)
    var promises = data.map((user)=>{
        if ($.inArray(user.username, listUserChecked) != -1){
            isChecked = true;
        }else{
            isChecked = false;
        }
        return htmlUserDialog(user.username, user.nickname, isChecked)
    })
    html = await Promise.all(promises)

    $('#list-receiver-dialog').html(html)
    return;
}

//render các checkbox group trong dialog add group ở dưới
async function renderGroupAddGroup(receiver){
    //lấy group của currentUser
    var groupOfCurrentUser = await getCheckedGroup();
    //lấy group của người cần add
    var groupOfReceiver = await getTotalGroupByUsername(receiver);
    //lập qua lấy code html
    var isDisable
    var html = groupOfCurrentUser.map((currentGr)=>{
        isDisable = groupOfReceiver.some((receiverGr)=>{
            return currentGr.id === receiverGr.id
        })
        return htmlGroupAddGroup(currentGr.name, currentGr.id, isDisable)
    })

    $('#listGroupAddGroup').html(html)
    return;
}

//render ra số lượng người đã đc check trong phần dialog
function renderNumberUserCheckedCreateGroup(){
    $('#count-user-checked').text(`Mời thêm bạn vào cuộc trò chuyện (${$('.dialog__choose-checked-item').length}) người`)
}

//render ra người dùng đã được chọn ở trên trong phần dialog
async function renderUserChecked(array){
    // console.log(array)
    var promises = array.map((item)=>{
        return htmlCheckedUserDialog(item.name, item.nickname)
    })
    html = await Promise.all(promises);
    console.log('render o tren')
    $('#user-choose').html(html);//inner html ra 
    renderNumberUserCheckedCreateGroup()//thay đổi số lượng nên là phải render lại số lượng người đã chọn
    return;
}

//render cái title ở trên cái tinh nhắn
async function renderThreadChat(idRoom, name, isPersonal){
    var html
    if (!isPersonal && !idRoom && !name){
        isPersonal = true;
        name = '';
    }
    if (!isPersonal){
        var length = await getLengthGroupByIdRoom(idRoom)
        console.log(length)
        html = htmlThreadChatGroup(name, length)
    }else{
        console.log('run here', name)
        html = htmlThreadChatPersonal(name)
    }
    $('#thread-chat').html(html)
}  

//khi click và tùy vào option mà render 
//ở bên phải trang home
function renderTotalUserByOption(option){
    // console.log('renderTotalUserByOption', option)
    if (option == 'personal'){
        renderTotalUser();
    }else if (option == 'group'){
        renderTotalGroup();
    }
} 
//đếm xem có bao nhiêu group đã đc chọn
//rồi render ra text
function renderNumberGroupChecked(){
    var length = $('.group-selected').length;
    var html = `Thêm vào nhóm (${length})`
    // console.log($('#count-group-selected'))
    $('#count-group-selected').html(html)
}

async function renderUserAddGroup(){
    var users = await getTotalUser();
    console.log(users)
    var promises = users.map((user)=>{
        return htmlUserDialog(user.username, user.nickname, false); 
    })
    var html = await Promise.all(promises);
    console.log(html)
    $('#list-user-add').html(html)
}
function renderNumberUserCheckedAddUser(){
    var length = $('#user-add-checked').find('.dialog__choose-checked-item').length
    $('#count-user-add').html(`Chọn thêm người bạn muốn trò chuyện (${length}) người`)
}

async function renderMessageCantFind(){
    var html = htmlMessageCantFind();
    
    $('#list-message').html(html)
}

async function renderContainerChat(){
    var idRoom = getCurrentIdRoom();
    console.log(idRoom)
    var infoRoom = await getCurrentUserRoomByIdRoom(idRoom); 
    console.log('renderContainerChat', {infoRoom, idRoom}) 

    if (infoRoom){
        renderMessage(idRoom);
    }else{
        htmlMessageCantFind();
    }
    console.log(infoRoom.id, infoRoom.name, infoRoom.is_personal)
    renderThreadChat(infoRoom.id, infoRoom.name, infoRoom.is_personal);
}


// function renderInputChangeName(){
//     var html = htmlInputChangeName();
//     console.log(html)
//     $('#thread-chat').html(html);
// }
//============================================================================================================
//---------------------------------------Function get data from api-------------------------------------------------
//============================================================================================================

//lay thong tin user hien tai
async function getCurrentUser(){
    return await axios.get('/api/current-user')
    .then((response)=>{
        return response.data[0]
    })
}

//lay thong tin tat ca user
async function getTotalUser(){
    return await axios.get('/api/total-user')
    .then((response)=>{
        return response.data
    })
}

//lay tat ca group cua currentUser
async function getTotalGroup(){
    return await axios.get('/api/total-group')
    .then((response)=>{
        return response.data;
    })
}

//lay thong tin nhung user nam trong chat ist
async function getCheckedUser(){
    return await axios.get('/api/checked-user')
    .then((response)=>{
        return response.data
    })
}

//lay ra cac message cua 2 user or group chat
async function getMessage(idRoom){
    return await axios.get(`/api/messages/${idRoom}`)
    .then((response)=>{
        return response.data
    })
}

//lay thong tinh nhung cai group ma currentUser dang o
async function getCheckedGroup(){
    return await axios.get('/api/checked-group')
    .then((response)=>{
        return response.data
    })
}

//lay tat ca group cua 1 user bat ky
async function getTotalGroupByUsername(receiver){
    return await axios.get(`/api/total-group/${receiver}`)
    .then((response)=>{
        return response.data
    })
}

//lay tat ca group cua 1 user bat ky
async function getLengthGroupByIdRoom(idRoom){
    console.log("dasdsad", idRoom)
    return await axios.get(`/api/length-group/${idRoom}`)
    .then((response)=>{
        return response.data
    })
}

//get info group
async function getCurrentUserRoomByIdRoom(idRoom){
    return await axios.get(`/api/group/${idRoom}`)
    .then((response)=>{
        return response.data
    })
}

async function getIdRoomNearest(){
    return await axios.get('/api/room-nearest')
    .then((response)=>{
        console.log(response.data)
        return response.data
    })
}
//============================================================================================================
//---------------------------------------Function show hide dialog -------------------------------------------------
//============================================================================================================

function showListMessage(){
    $('#list-message').removeAttr("hidden")
}
    
function hideListMessage(){
    $('#list-message').attr("hidden", "hidden");
}

function showDialogCreateGroup(){
    // console.log("show create group")
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
    $('#dialogAddGroup').attr("hidden", "hidden")
    $('.overlay').attr("hidden", "hidden")
}

function showDialogAddUser(){
    $('#dialogAddUser').removeAttr("hidden")
    $('.overlay').removeAttr("hidden")
}

function hideDialogAddUser(){
    // console.log($('#dialogAddUser'))
    $('#dialogAddUser').attr("hidden", "hidden")
    $('.overlay').attr("hidden", "hidden")
}

function hideAllDialog(){
    $('#dialogAddGroup').attr("hidden", "hidden")
    // $('#dialogAddUser').attr("hidden", "hidden")
    $('#dialogCreateGroup').attr("hidden", "hidden")
    $('.overlay').attr("hidden", "hidden")
}
//============================================================================================================
//------------------------------------------------Hàm dùng lại nhiều lần--------------------------------------
//============================================================================================================

function sortByUpdatedAt(array){
    array = array.sort((a, b)=>{ //sau đó sắp xếp theo thời gian
        //để người nào tương tác gần thì ở trên
        var aValue = new Date(a.updatedAt).getTime()//chuyen thoi gian sang number de so sanh
        var bValue = new Date(b.updatedAt).getTime()

        return bValue - aValue 
    })
    return array;
}

//đóng dialog 
function handleCloseDialog(array, callback){
    array.forEach((item)=>{
        $(item).click(function(){
            swal({
                title: "Xác nhận",
                text: "Bạn có chắc muốn bỏ tạo nhóm này?",
                buttons: true,
            })
            .then((willDelete) => {//nếu click ok thì ẩn dialog đi
                if (willDelete){
                    callback()
                }
            });
        })
    })
}

//khi nhấn vào dấu x trong user checked trong dialog
function handleRemoveAndCheck(element, type){
    var nameData = "data-" + type;
    var containerTag = $(element).closest(".dialog__choose-checked-item");
    var idRoom = containerTag.attr(nameData);
    containerTag.closest('.dialog__choose')
                .find(".dialog__choose-list input[" + nameData + "='" + idRoom + "']")
                .prop('checked', false);
    containerTag.remove();
    return;
}
//sử lý khi click checkbox trong dialog
async function handleClickCheckbox(element, type, callback){
    var primary = $(element).data(type);//username or idRoom
    if ($(element).is(':checked')){
        await callback()
    }else{
        $(".dialog__choose-checked-item[data-" + type + "= " + primary + "]").remove()
    }
    return
}


//tùy vào option và dialog nào mà mình render khác nhau
function filterByOption(container, renderCallBack){
    $(container).on('click', 'div.dialog__option-container', function(){
        console.log(this)
        var option = $(this).data('option');
        $(container)
                .find('.dialog__option-container.active')
                .removeClass('active');

        $(this).addClass('active');
        renderCallBack(option)
    })
}

async function getCheckedListByOption(option){
    switch(option){
        case 'personal':{
            var checkedUsers = await getCheckedUser();
            return sortByUpdatedAt(checkedUsers)
        }
        case 'group':{
            var checkedGroups = await getCheckedGroup();
            return sortByUpdatedAt(checkedGroups)
        }
        case 'all':{
            var checkedUsers = await getCheckedUser();
            var checkedGroups = await getCheckedGroup();
            var result = checkedUsers.concat(checkedGroups)
            return sortByUpdatedAt(result)
        }
    }
}

async function renderCheckedListByOption(option){
    var result = await getCheckedListByOption(option);
    var html = result.map((user)=>{ //{sender, receiver, updatedAt, id}
        if (user.is_personal){//kiểm tra nếu personal thì reder theo personal
            return htmlCheckedUser(user.username, user.nickname, user.id)
        }else{//còn group thì render theo group
            return htmlCheckedGroup(user.name, user.id)
        }
    })
    $('#list-chat-user').html(html)      
    activeCurrentReceiver()
}

function checkBtnSubmit(container, lengthRequire){
    var length = $(container).find('.dialog__choose-checked-item').length
    var btnSubmit = $(container).find('.dialog__footer-btn.create')
    if (length >= lengthRequire){
        btnSubmit.removeAttr('disabled', 'disabled')
            .css('cursor', 'default');
    }else{
        btnSubmit.attr('disabled', 'disabled')
            .css('cursor', 'not-allowed');
    }
}
function scrollChatList(){
    var listMessageElement = document.querySelector('#list-message')
    listMessageElement.scrollTop = 9999999
}

function getCurrentIdRoom(){
    var urlString = window.location.pathname;
    return urlString.split('/')[2]
}


//thay đổi style màu bg cho thằng vừa tương tác 
function activeCurrentReceiver(){
    var currentIdRoom = getCurrentIdRoom() || $('#btn-send-message').data('idroom')
    console.log(currentIdRoom)

    $('.list-chat-user-item.active').removeClass('active')//xóa hết mấy thằng có class active
    window.history.pushState("", "", `/chat/${currentIdRoom}`)
    renderContainerChat()
    //cái thằng có data-id bằng với cái idRoom hiện tại 
    var $itemActive =  $(`.list-chat-user-item[data-id=${currentIdRoom}]`)
    $itemActive.addClass('active')
}
//============================================================================================================
//---------------------------------------Hàm hổ trợ dialog Create Group---------------------------------------
//============================================================================================================

//lấy user đã check ở dưới create group
function getUserCheckedByCheckboxCreateGroup(){
    var listUserChecked = $('#user-choose')
        .find('.dialog__choose-checked-item[data-name != ' + $('#username').data('name') + ']')
        .map(function(){
            return $(this).data('name');
        }).toArray()
    return listUserChecked
}

//lấy data của user tùy vào options
async function getUserByOptionCreateGroup(option){
    var data;
    switch (option){
        case "all":{
            data = await getTotalUser()
            break;
        }
        case "in_list":{
            data = await getCheckedUser()
            break;
        }
        case "checked":{
            data = $('.dialog__choose-item-input:checked').map(function(){//lay ra nhung thang da chon
                return {
                    username: $(this).data('name'),
                    nickname: $(this).siblings('label').text()
                }
            })
            data = data.toArray()
            break;
        }
    }
    return data;
}
//render trong dialog create group
function filterUserCreateGroup(){
    filterByOption('#filter-user-create-group', renderReceiversCreateGroupByOption)
}

function checkBtnSubmitCreateGroup(){
    checkBtnSubmit('#dialogCreateGroup', 3);
}

//đóng dialog create group
function handleCloseDialogCreateGroup(){
    var array = ['#headerIconCloseCreateGroup', '#btnCloseCreateGroup']
    handleCloseDialog(array, hideDialogCreateGroup)
}

//click check box create group 
function handleClickCheckboxCreateGroup(){
    $('#list-receiver-dialog').on('change', 'input.dialog__choose-item-input', async function(){
        var username = $(this).data('name');
        var nickname = $(this).siblings('label').text();
        await handleClickCheckbox(this, 'name',async function(){
            
            var html = await htmlCheckedUserDialog(username, nickname)
            $('#user-choose').append(html)
        });
        checkBtnSubmitCreateGroup()
        renderNumberUserCheckedCreateGroup() 
    })
}


//khi nhấn vào dấu x trong user checked trong dialog cre gr
function handleClickRemoveCreateGroup(){
    $('#user-choose').on('click', 'div.container-close', function(){
        handleRemoveAndCheck(this, 'name');

        checkBtnSubmitCreateGroup()
        renderNumberUserCheckedCreateGroup()
    })
}

function submitDialogCreateGroup(){
    //cái này là khi mà tạo bằng from 
    //khi click vào tạo
    $('#btn-create-group-chat').click(async function(){
        var listNameUserChecked = [];
        //lấy ra tên của những thằng đã được chọn
        // console.log('submitDialogCreateGroup', $('.dialog__choose-checked-item'))
        $('.dialog__choose-checked-item').off().each(function(index, userCheckedItem){
            listNameUserChecked.push($(userCheckedItem).data('name'));
        })
        // console.log(listNameUserChecked)
        //rồi gọi ajax về server sử lý
        var currentUser = await getCurrentUser(); 
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


async function getUserCheckedCreateGroup(ele){
    var container = $(ele).closest('.list-chat-user-item')
    var currentUser = await getCurrentUser();

    $('#list-receiver-dialog')
        .find('.dialog__choose-item-input[data-name=' + container.data('name') + ']')
        .prop('checked', true)

    //hiện dialog create group và cho thêm cái overlay bên ngoại hiện lên
    //Sau đó sẽ có 2 thằng đầu tiên được auto chọn là
    //thằng currentUser và thằng được click theo thứ tự ở dưới
    var userChecked = [
        {
            nickname: currentUser.nickname,
            name: currentUser.username,
        }, 
        {
            nickname: container.data('nickname'),
            name: container.data('name'),
        }
    ]
    return userChecked
}

//============================================================================================================
//---------------------------------------Hàm hổ trợ dialog Add Group---------------------------------------
//============================================================================================================


//sử lý khi đóng cái dialog add group

function checkBtnSubmitAddGroup(){
    checkBtnSubmit('#dialogAddGroup', 1);
}
function closeDialogAddGroup(){
    var array = ['#btnCloseAddGroup', '#headerIconCloseAddGroup']
    handleCloseDialog(array, hideDialogAddGroup)
}

//khi mà click vào checkbox trong dialog add group
function handleChangeCheckboxAddGroup(){
    $('#listGroupAddGroup').on('change', 'div input.checkbox-select-group', function(){
        var idRoom = $(this).data('idroom');
        var nameGr = $(this).siblings('label').text();
        handleClickCheckbox(this, 'idroom',async function(){
            var html = htmlGroupCheckedAddGroup(idRoom, nameGr);
            $('#groupSelected').append(html);
        })
        
        renderNumberGroupChecked()//đếm lại số lượng group đã check
        checkBtnSubmitAddGroup()//check xem nếu mà có chọn ít nhất 1 group thì mới cho submit
    })
}

//khi nhấn vào dấu x trong user checked trong dialog add gr
function handleClickRemoveAddGroup(){
    $('#groupSelected').on('click', 'div.remove-group', function(){
        handleRemoveAndCheck(this, 'idroom');
        renderNumberGroupChecked();
        checkBtnSubmitAddGroup();
    })
}

function submitDialogAddGroup(userAdd){
    $('#btnAddGroup').on('click', function(){
        var idRooms = $('.group-selected').map(function(){
            return $(this).data('idroom');
        }).toArray();

        //sau đó gọi ajax xuống backed sử lý
        $.ajax({
            url: '/add-group-chat', 
            method: 'POST',
            data: {
                userAdd: userAdd,
                idRooms: idRooms
            },
            success: function(){
                //sau khi xong thì đóng dialog
                hideDialogAddGroup()
            }
        })
    })
}

//============================================================================================================
//---------------------------------------Hàm hổ trợ dialog Add User---------------------------------------
//============================================================================================================

function closeDialogAddUser(){
    var array = ['#btnCloseAddUser', '#headerIconCloseAddUser']
    handleCloseDialog(array, hideDialogAddUser)
}

//khi mà click vào checkbox trong dialog add group
function handleChangeCheckboxAddUser(){
    $('#list-user-add').on('change', 'input.dialog__choose-item-input',async function(){
        var username = $(this).data('name');
        var nickname = $(this).siblings('label').text();
        await handleClickCheckbox(this, 'name',async function(){
            
            var html = await htmlCheckedUserDialog(username, nickname);
            $('#user-add-checked').append(html);
            return;
        })
        renderNumberUserCheckedAddUser();
        checkBtnSubmitAddUser();
        // renderNumberGroupChecked()//đếm lại số lượng group đã check
        // checkBtnSubmitAddGroup()//check xem nếu mà có chọn ít nhất 1 group thì mới cho submit
    })
}

function handleClickRemoveAddUser(){
    $('#user-add-checked').on('click', 'div.container-close', function(){
        handleRemoveAndCheck(this, 'name');
        checkBtnSubmitAddUser();
        renderNumberUserCheckedAddUser();
        // checkBtnSubmitAddGroup();
    })
}
function submitDialogAddUser(){
    $('#btnCreateAdduser').on('click', function(){
        var receivers = $('#user-add-checked')
            .find('.dialog__choose-checked-item')
            .map((idx, container)=>{
                console.log($(container).data('name'))
                return $(container).data('name')
            })
            .toArray();
        console.log(receivers);

        $.ajax({
            url: '/add-chat-list',
            data: {
                receivers: receivers
            },
            method: 'POST',
            success: function(){
                hideDialogAddUser();
            } 
        })
    })
}
function checkBtnSubmitAddUser(){
    checkBtnSubmit('#dialogAddUser', 1);
}
//============================================================================================================
//---------------------------------------Hàm hổ trợ sử lý trang chat---------------------------------------
//============================================================================================================

//hàm làm đẹp sử lý khi hover vào item của list receiver thì đổi màu tí
//và đổi con chuột sang poiter và đổi màu thằng đang chọn cho nó khác biệt
function handleHoverListReceiver(){
    $('#list-chat-user').on('mouseover', '.list-chat-user-item', function(){
        $(this).removeClass('list-group-item-info')
            .addClass('list-group-item-primary')
            .css('cursor', 'pointer') //thay doi con chuot
    })
    
    $('#list-chat-user').on('mouseout', '.list-chat-user-item', function(){
        $(this).removeClass('list-group-item-primary')
            .addClass('list-group-item-info')
    })

    $('#list-chat-user').on('click', '.list-chat-user-item', function(){
        //them active cho chinh thang do khi click vo no
        $('.list-chat-user-item.active').removeClass('active')
        $(this).addClass('active')
        //thêm nữa là hiện cái container chat lên
        //đôi khi vừa ẩn xong nhấn qua cái khác
        $('.container-send-message').show()
        // console.log("SHOW")
    })
}
function filterCheckedList(){
    filterByOption('#filter-checked-list', renderCheckedListByOption)
}


//hadle when hover and click to a user in chat list
async function handleClickReceiver(){
    $('#list-chat-user').on('click', 'li', function(){
        var idRoom = $(this).data('id')
        var name = $(this).data('nickname')
        var isPersonal = $(this).data('name') ? true : false

        //thay đổi url cho giống với thực tế để copy sẽ ra đúng trang đó
        window.history.pushState("", "", `/chat/${idRoom}`)
        //thay đổi attribuute data-idroom để mà sau này sẽ lấy cái data này 
        //gữi về cho server 
        renderContainerChat();
        // renderThreadChat(idRoom, name, isPersonal)
        showListMessage()
    })
}

//render cho total user theo option
function filterListTotalUser(){
    filterByOption('#filter-total-list', renderTotalUserByOption)
}

function closeDialogByOverlay(){
    $('.overlay').on('click', function(){
        var isHideDialogCreateGroup = $('#dialogCreateGroup').attr('hidden');
        var isHideDialogAddGroup = $('#dialogAddGroup').attr('hidden');
        if (!isHideDialogCreateGroup || !isHideDialogAddGroup){
            handleCloseDialog(['.overlay'], hideAllDialog)
        }
    })
}

function changeName(){
    $(document).on('click', '#edit-name', function(){
        console.log('hi')
        $('#name-room').attr('hidden', 'hidden');
        $('#container-change-name').removeAttr('hidden')
    })
    submitChangeName()
}

function submitChangeName(){
    $(document).on('click', '#submit-change-name', function(){
        var text = $('#input-change-name').val();
        var idRoom = getCurrentIdRoom()
        var data = {
            text,
            idRoom,
        }
        console.log(data)

        $('#container-change-name').attr('hidden', 'hidden')
        $.ajax({
            url: '/change-name',
            data: data,
            method: 'POST',
            success: async function(){
                var infoRoom = await getCurrentUserRoomByIdRoom(idRoom); 
                renderThreadChat(infoRoom.id, infoRoom.name, infoRoom.is_personal)                    
            }
        })
    })
    
}


$(document).ready(()=>{
//==============================================================================================================
//---------------------------------------Function handle event -------------------------------------------------
//==============================================================================================================
    
    //functuon emit to server socket id of new user login
    function emitSocketIdOfCurrentUserToServer(){
        getCurrentUser() //[{nickname, username, socketid}]
        .then((data)=>{
            //emit về server để add socketid
            socket.id = data.socketid
            socket.emit('change socket', socket.id)
        })
        .catch((err)=>{
            throw err
        })
    }

    //add a user to chat list
    function addChatListUser(){
        $('#list-total-user').on('click', 'button.add-chat-list',async function(){
            var currentUser = await getCurrentUser();
            var container = $(this).closest('.list-group-item');
            var data = {//username của receiver và sender 
                receiver: container.data('name'),
                sender: currentUser.username,
            }
            console.log('addChatListUser', data)
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
    }

    function addChatListGroup(){
        $('#list-total-user').on('click', 'button.add-chat-list-group', function(){
            var container = $(this).closest('.list-group-item')
            var idRoom = container.data('idroom')
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
        $('#list-chat-user').on('click', 'button.hide-chat-list', function(){
            var data = {
                idRoom: getCurrentIdRoom(),
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
        
        $('#list-chat-user').on('click', 'button.create-group-chat', async function(){
            
            var container = $(this).closest('.list-chat-user-item')
            var userChecked = await getUserCheckedCreateGroup(this)
            renderUserChecked(userChecked);

            await renderReceiversCreateGroupByOption("in_list");

            console.log(userChecked)
            showDialogCreateGroup()

            $(`.dialog__choose-item-input[data-name=${container.data('name')}]`)
                .prop('checked', true);
        
        })
        checkBtnSubmitCreateGroup();
        handleClickCheckboxCreateGroup()

        //su ly khi chon option
        filterUserCreateGroup()
        submitDialogCreateGroup()
        handleClickRemoveCreateGroup()//ham de su ly viec them hoac xoa 1 user vao muc create group
        handleCloseDialogCreateGroup();
    }
    //hàm chính sử lý dialog add group
    async function handleDialogAddGroup(){
        
        
        $('#list-chat-user').on ('click', 'button.add-group-chat', async function(){
            var containerTag = $(this).closest('.list-chat-user-item')
            var userAdd = containerTag.data('name')
            $('#groupSelected').html('')
            await renderGroupAddGroup(userAdd);//sau đó render ra cái checkbox ở dưới
            //lấy ra username của receiver và số lượng group đã chọn
            submitDialogAddGroup(userAdd);
            renderNumberGroupChecked()//đếm số lượng gr đã chọn
            checkBtnSubmitAddGroup()///check xem là có thể submit ko
            showDialogAddGroup();//khi click vào thêm vào nhóm thì hiển thị cái dialog ra
            
        })
        handleChangeCheckboxAddGroup();//sử lý khi click vào checkbox ở dưới
        handleClickRemoveAddGroup();//sử lý khi nhấn vào dấu X ở trên
        closeDialogAddGroup();//sửu lý khi đóng dialog 
    }

    //functuon sử lý khi chat
    async function sendMessage(){
        $('#btn-send-message').on('click', async function(){
            var sender
            var text = $('#input-send-message').val()
            var idRoom = getCurrentIdRoom()
            var currentUser = await getCurrentUser();
            //lấy ra username của người nhận message
            //lấy thằng có class đó và có data-id == idRoom hiện tại rồi lấy ra name của nó
            sender = $(`.list-chat-user-item[data-id=${idRoom}]`).data('name')
           
            // console.log(sender)
            if (text){
                //emit tới server data của message
                var dataMessage = {
                    sender: currentUser.username,
                    idRoom: idRoom,
                    message: text
                }
                $('#input-send-message').val('')
                socket.emit('sender send message', dataMessage)

                //nếu là personal
                if (sender){
                    // còn phần này là hgọi ajax tới addChatListUser
                    // để người gữi
                    // tại cái này là add thằng gữi vào
                    // list chat của thằng nhận nên receiver và sender ngược nhau 
                    var data = {
                        receiver: sender,
                        sender: currentUser.username,
                        
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
                        idRoom: idRoom,
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
    

    

    

    async function handleDialogAddUser(){
        showDialogAddUser();
        renderUserAddGroup();
        renderNumberUserCheckedAddUser();
        checkBtnSubmitAddUser();
        handleChangeCheckboxAddUser();
        handleClickRemoveAddUser();
        submitDialogAddUser()
    }


    
    
    //hàm chính để sử lý
    async function main(){
        scrollChatList() //scroll thanh chat xuong
        emitSocketIdOfCurrentUserToServer()
        renderTotalUser() //block ben phai
        await renderCheckedUserAndGroup() //block ben trai
        activeCurrentReceiver() //doi mau nguoi dang chat
        closeDialogByOverlay();
        var currentIdRoom = await getIdRoomNearest();
        if (!currentIdRoom > 0){
            handleDialogAddUser();
        }

        sendMessage() //sy ly khi gui tinh nhan
        hideChatList() //su ly khi nhan vao Ẩn
        addChatListGroup()
        handleDialogCreateGroup() //su ly khi nhan vao
        handleDialogAddGroup()
        handleClickReceiver() //
        handleHoverListReceiver()
        addChatListUser() //su ly khi nhan vao them
        filterListTotalUser()
        filterCheckedList()
        changeName()
        showListMessage()
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
        // console.log('sender add chat list', {receiver, id, nickname, isActive})
        //remove thang receiver sau do render lai
        $(`.list-chat-user-item[data-id=${id}]`).remove();
        if (isActive){
            window.history.pushState("", "", `/chat/${id}`)
            // renderMessage(id);
            showListMessage()
            // $('.list-chat-user-item.active').removeClass('active')
        }
       

        var littleHtml = htmlCheckedUser(receiver, nickname, id)
        var html = littleHtml.concat($('#list-chat-user').html())
        $('#list-chat-user').html(html)
        
        // $(`.list-chat-user-item[data-name="${data.receiver}"]`).addClass('active');
        
        // handleHoverListReceiver()
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
        // console.log("socket/sendMessage",sender, $('#username').data('name'))
        if (getCurrentIdRoom() === idroom){
            var html = htmlMessage(sender, message)
            $('#list-message').append(html)
            scrollChatList()
        }
    })

    //add chat list khi nó là group
    socket.on('add chat list group', ({groupName, idRoom, isActive})=>{
        //nếu mà có sẳn cái group đó rồi thì xóa group đó đi //tí sẽ render lại
        $(`.list-chat-user-item[data-id=${idRoom}]`).remove();
        // console.log('senderCreateGroup/home', {groupName, idRoom, isActive})

        //sau đó lấy html của cái group đó rồi render lại
        var html = htmlCheckedGroup(groupName, idRoom);
        //mục đích là cho nó lên đầu
        html += $('#list-chat-user').html()        
        $('#list-chat-user').html(html);

        //nếu mà có active thì set lại cái idRoom và show đúng mesage của room đó
        if (isActive){
            // renderMessage(id);
            window.history.pushState("", "", `/chat/${idRoom}`)

            showListMessage()
        }
        activeCurrentReceiver()
        // handleHoverListReceiver()
        $('.container-send-message').show()
    })

})

