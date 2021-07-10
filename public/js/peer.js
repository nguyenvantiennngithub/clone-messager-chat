var username = $('#container-user').data('username');
var displayName = $('#container-user').text();
var avatar = $('#container-user').find('img').attr('src')
var idRoom = window.location.pathname.split('/')[2];

var myPeer = new Peer();
var socket = io();
var peers = {}
var listUser = {};
function openStream(){
    return navigator.mediaDevices.getUserMedia({audio: false, video: true})
}

function renderContainerVideo(streamId, user){
    var html = `
    <div class="container-video" data-username="${streamId}">
        <video src="" class="video" width="400px"></video>
        <div class="container-info">
            <img class="avatar" src="${user.avatar}">
            <span class="text-displayName">${user.displayName}</span>
        </div>
    </div>`
    $('#app').append(html);
    return;
}

function addVideo(stream, user){
    renderContainerVideo(stream.id, user);
    var video = $(`.container-video[data-username="${stream.id}"]`).find('video')[0];
    video.srcObject = stream;
    video.play();
    return;

}
socket.on('hello new user', function(_listUser){
   listUser = _listUser;
})

$(document).ready(async ()=>{
    var myStream = await openStream();
    var user = {username, displayName, avatar}

    myPeer.on('open', async function(peerId){        
        addVideo(myStream, user);

        socket.emit('new user connect room', {peerId, idRoom, user});

        socket.on('user connected', function(data){//remotePeerId, user
            var call = myPeer.call(data.remotePeerId, myStream);
            peers[data.remotePeerId] = call;
            listUser[data.remotePeerId] = data.user;
            console.log(myStream, user)
            console.log("CALL")
            
            call.on('stream', function(remoteStream){
                console.log("CALL STREAM");
                var remotePeerId = call.peer
                addVideo(remoteStream, listUser[remotePeerId]);
            })
        })

        myPeer.on('call', function(call){
            call.answer(myStream);

            call.on('stream', function(remoteStream){
                var remotePeerId = call.peer;
                addVideo(remoteStream, listUser[remotePeerId]);
            })
        })
    })
    
    








    // peer.on('open', async function(peerId){
    //     console.log(peerId)
    //     var stream = await openStream();
    //     stream.username = username
    //     socket.emit('new user connect room', {peerId, idRoom})
        
    //     socket.on('user connected', function(peerIdRemote){
    //         peers[peerIdRemote] = stream;
    //         var call = peer.call(peerIdRemote, stream);
    //         addVideo(stream)
            
    //         call.on('stream', function(remoteStream){
    //             addVideo(remoteStream)
    //         })
    //     })

    //     peer.on('call', function(call){
    //         call.answer(stream);
    //         addVideo(stream)

    //         call.on('stream', function(remoteStream){
    //             addVideo(remoteStream)
    //         })
    //     })
    // })
})
