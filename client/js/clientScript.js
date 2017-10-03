/**
 * Created by Ivan Zamora Arias on 9/21/17.
 */
var DEBUG=true;
var divChatText= document.getElementById("chat-text");
var divChatInput= document.getElementById("chat-input");
var chatForm=document.getElementById("chat-form");

var canvas=document.getElementById("ctx");
var ctx= document.getElementById("ctx").getContext("2d");
ctx.font='30px Arial';
//ctx.color='red';
var socket =io();

//updte character positions
socket.on('newPosition',function (data) {
    console.log('Update Position ');

    //draw players
    ctx.clearRect(0,0,500,500);
    for(var i=0;i<data.players.length;i++) {
        ctx.fillText(data.players[i].number, data.players[i].x, data.players[i].y);
        ctx.fillRect(data.players[i].x-10,
            data.players[i].y-10,
            20,20)
    }
    //draw bullet
    for(var i=0;i<data.bullets.length;i++)
        ctx.fillRect(data.bullets[i].x-5,data.bullets[i].y-5,10,10);
});

//update chat
socket.on("addToChat",function(data){
    divChatText.innerHTML += '<div>'+data+'</div>'
});
socket.on("sendEvalAnswer",function(data){
    console.log(data);
});
//submit text to server
chatForm.onsubmit=function (e) {
    e.preventDefault();

    if(divChatInput.value[0]=='/')
        socket.emit('sendEvalMessage', divChatInput.value.slice(1));
    else
        socket.emit('sendMessageToChatServer', divChatInput.value);
    divChatInput.value='';
}

document.onkeydown= function (event) {
    if(event.keyCode === 68)    //d
        socket.emit('keyPress',{inputId:'right',state:true});
    else if(event.keyCode === 83)   //s
        socket.emit('keyPress',{inputId:'down',state:true});
    else if(event.keyCode === 65) //a
        socket.emit('keyPress',{inputId:'left',state:true});
    else if(event.keyCode === 87) // w
        socket.emit('keyPress',{inputId:'up',state:true});

}

document.onkeyup= function (event) {
    if(event.keyCode === 68)    //d
        socket.emit('keyPress',{inputId:'right',state:false});
    else if(event.keyCode === 83)   //s
        socket.emit('keyPress',{inputId:'down',state:false});
    else if(event.keyCode === 65) //a
        socket.emit('keyPress',{inputId:'left',state:false});
    else if(event.keyCode === 87) // w
        socket.emit('keyPress',{inputId:'up',state:false});

}

document.onmousedown= function (event) {
    socket.emit('keyPress',{inputId:'click',state:true});
}
document.onmouseup= function (event) {
    socket.emit('keyPress',{inputId:'click',state:false});
}

document.onmousemove= function (event) {

    var x = -canvas.width/2 + event.clientX ;
    var y = -canvas.height/2 + event.clientY ;
    var angle = Math.atan2(y,x) / Math.PI * 180;
    socket.emit('keyPress',{inputId:'mousemove',angle:angle});
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
canvas.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    var angle= Math.atan2(mousePos.y,-mousePos.x)*180/Math.PI;
    var message = 'Canvas mousemove: ' +'angle: '+angle+' :'+ mousePos.x + ',' + mousePos.y;

    console.log(message);
    //socket.emit('keyPress',{inputId:'mousemove',angle:angle});
}, false);

// setInterval(function () {
//     socket.emit('keyPress',{inputId:'mousemove',angle:0});
//     socket.emit('keyPress',{inputId:'click',state:true});
// },100/6);
