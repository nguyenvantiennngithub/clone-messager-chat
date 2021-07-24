var myPeer = new Peer();
var socket = io();
var peers = {}
var listUser = {};
console.log(myPeer);

function openStream(){
    return navigator.mediaDevices.getUserMedia({audio: true, video:  { width: 1280, height: 720}})
}

async function renderContainerVideo(user, isMute){
    var html = `
    <div class="container-video" data-peer="${user.peerId}">
        <video src="" class="video" width="400px" height="225px" `
    if (isMute){
        html += `muted="true"`;
    }
    html +=                                      `>
        </video>
        <div class="setting-call">
            <div class="setting-call-mic">
                    <div class="setting-call-mic-middle">
                        <i class="fas fa-microphone-alt"></i>
                    </div>
                </div>`
    if (isMute){
        html +=
            `
            <div class="setting-call-video" id="off-cam">
                <div class="setting-call-video-middle">
                    <i class="fas fa-video"></i>
                </div>
            </div>
            <div class="setting-leave-room muted" id="leave-room">
                <div class="setting-leave-room-middle">
                    <i class="fas fa-phone"></i>
                </div>
            </div>
            `
    }        
    html+=
            `
        </div>
        <div class="container-info">
            <img class="avatar" src="${user.avatar}">
            <span class="text-displayName">${user.displayName}</span>
        </div>
    </div>`
    $('#app').append(html);
    return;
}

async function addVideo(stream, user, isMute){
    var checkExistsVideo = $(`.container-video[data-peer="${user.peerId}"]`)
    if (checkExistsVideo.length == 1){
        console.log("return")
        return;
    }
    await renderContainerVideo(user, isMute);
    var video = $(`.container-video[data-peer="${user.peerId}"]`).find('video')[0];
    console.log(video)
    video.srcObject = stream;
    video.play();
    return;
}



socket.on('hello new user', function(_listUser){
   listUser = _listUser;
})

var username = $('#container-user').data('username');
var displayName = $('#container-user').text();
var avatar = $('#container-user').find('img').attr('src')
var idRoom = window.location.pathname.split('/')[2];

async function main(){
    await myPeer.on('open', function(peerId){ 
        return;
    })
    console.log(myPeer.id)
    
    openStream().then(async function(myStream){
        
        if (myPeer.id == null){
            alert("NULL")
            // window.location.reload();
        }

        var user = {username, displayName, avatar, peerId: myPeer.id}
        console.log("user prepare", user);
        addVideo(myStream, user, true);//just mute myseft
        socket.emit('new user connect room', {user, idRoom});
        
        myPeer.on('call', function(call){
            call.answer(myStream);
            call.on('stream', function(remoteStream){
                var remotePeerId = call.peer;
                addVideo(remoteStream, listUser[remotePeerId], false);
            })
        }) 

        //remote user
        socket.on('user connected', function(remoteUser){
            console.log("CALL", remoteUser);
            var call = myPeer.call(remoteUser.user.peerId, myStream);
        
            peers[remoteUser.user.peerId] = call;
            listUser[remoteUser.user.peerId] = remoteUser.user;
    
            call.on('stream', function(remoteStream){
                console.log("STREAM CALL", call)
                var remotePeerId = call.peer    
                addVideo(remoteStream, listUser[remotePeerId], false);
            })

        })
        socket.on('someone left room', function(remotePeerId){
            $(document).find(`.container-video[data-peer=${remotePeerId}]`).remove();
        })

        $(document).on('click', '.setting-call-mic', function(){
            var streamId = $(this).closest('.container-video').data('peer');
            //if is qmyself
            if (streamId == myPeer.id){
                myStream.getAudioTracks()[0].enabled = !(myStream.getAudioTracks()[0].enabled);
                console.log(myStream.getAudioTracks()[0].enabled)
            }else{
                var video = $(this).closest('.setting-call').siblings('.video')
                video.prop('muted', !video.prop('muted')); //true is muted
            }
            $(this).toggleClass('muted')
        })

        $(document).on('click', '#off-cam', function(){
            myStream.getVideoTracks()[0].enabled = !(myStream.getVideoTracks()[0].enabled);
            $(this).toggleClass('muted')
        })
        
        $(document).on('click', '#leave-room', function(){
            window.close();
        })
    })
}

main();

