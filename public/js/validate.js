// {container: '#dialogCreateGroup', selector: '#filterCreateGroup', rule: 'length', data: '2', message: 'Ít nhất 2 ký tự'}, 
const options = [
    {container: '#dialogCreateGroup', selector: '#name-group', rule: 'require', message: 'Bắt buộc'}, 
    {container: '#dialogCreateGroup', selector: '#avatar', rule: 'require', message: 'Bắt buộc'}, 

    {container: '#form-register', selector: '#nickname', rule: 'require', message: 'Bắt buộc'}, 
    {container: '#form-register', selector: '#username', rule: 'require', message: 'Bắt buộc'}, 
    {container: '#form-register', selector: '#avatar', rule: 'require', message: 'Bắt buộc'}, 
    {container: '#form-register', selector: '#password', rule: 'length', data: 3, message: 'Ít nhất 3 ký tự'}, 

    {container: '#form-login', selector: '#username', rule: 'require', message: 'Bắt buộc'}, 
    {container: '#form-login', selector: '#password', rule: 'length', data: 3, message: 'Ít nhất 3 ký tự'}, 

]

function addMessage(ele, message){
    $(ele).css({"border": "1px solid red", "background-color": "#f1e0e0"})
        .siblings('span.dialog-message').text(message)
}

function removeMessage(ele){
    $(ele).css({"border": "1px solid #eee", "background-color": "white"})
        .siblings('span.dialog-message').text('')
}
function checkValidator(option){
    var result
    if (option.rule === 'require'){
        result = validator.isRequire(option.selector);
    }else if (option.rule === 'length'){
        result = validator.isLength(option.selector, option.data); 
    }
    if (result){
        removeMessage($(option.selector))
    }else{
        addMessage($(option.selector), option.message)
    }
    return result;
}
function validator(){
    
    options.forEach((option)=>{
        $(document).on('blur', option.selector, function(){
            checkValidator(option);
        })

        $(document).on('input', option.selector, function(){
            removeMessage(this)
        })
    })
}

validator.isRequire = function(selector){
    var type = $(selector).attr('type');
    if (type === 'file'){
        return $(selector).prop('files')[0]
    }else{
        return $(selector).val().length > 0;
    }
}

validator.isLength = function(selector, length){
    return $(selector).val().length >= length;
}

validator.submit = function(container){
    var allValidate = true;
  
    inputs = options.filter((option)=>{
        return option.container === container
    })
    
    console.log(inputs)

    inputs.forEach((input)=>{
        var isValidate = checkValidator(input);
        if (!isValidate) allValidate = false;
    })

    return allValidate;
}


validator();