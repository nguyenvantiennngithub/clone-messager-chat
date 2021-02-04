
var socket = io();

$(document).ready(()=>{
    axios.get('/api/users')
        .then(function (response) {
            // vào DB lấy list users để render 
            var html = response.data.map((user) => {
                return `<li class="list-group-item list-group-item-success">${user.nickname}</li>`
            });

            $('#list-total-user').html(html)
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        })
})