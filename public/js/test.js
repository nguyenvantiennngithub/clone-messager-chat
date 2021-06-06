async function handleClickCheckbox(element, type, callback){
    var primary = $(element).data(type);//username or idRoom
    if ($(element).is(':checked')){
        await callback()
    }else{
        $(".dialog__choose-checked-item[data-" + type + "= " + primary + "]").remove()
    }
    return
}



function handleChangeCheckboxCreatePersonalChatsVersion2(){
    handleClickCheckbox('#list-user-add', 'name', async function(primary, foreign){
        var html = await htmlCheckedUserDialog(primary, foreign);
        $('#user-add-checked').append(html);
        return;
    }, function(){
        renderNumberCheckedUserCreatePersonalChats();
        checkBtnSubmitCreatePersonalChats();
    })
}
function handleChangeCheckboxAddUserToGroups(){
    handleClickCheckbox('#groupAddUserToGroups', 'idroom', async function(primary, foreign){
        var html = htmlGroupCheckedAddUserToGroups(primary, foreign);
        $('#groupSelectedAddUserToGroups').append(html);
    }, function(){
        renderNumberGroupCheckedAddUserToGroups()
        checkBtnSubmitAddUserToGroups()
    })
}

function handleChangeCheckboxAddUserToGroups(){
    $('#gropAddUserToGroups').on('change', 'div input.checkbox-select-group', function(){
        var idRoom = $(this).data('idroom');
        var nameGr = $(this).siblings('label').text();
        handleClickCheckbox(this, 'idroom',async function(){
            
        })
        
        
    })
}