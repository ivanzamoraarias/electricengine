/**
 * Created by root on 9/21/17.
 */
var divChatText= document.getElementById("chat-text");
var divChatInput= document.getElementById("chat-input");
var chatForm=document.getElementById("chat-form");


var ctx= document.getElementById("ctx").getContext("2d");
ctx.font='30px Arial';
//ctx.color='red';
var socket =io();

//updte character positions
socket.on('newPosition',function (data) {
    console.log('Update Position ');

    //draw players
    ctx.clearRect(0,0,500,500);
    for(var i=0;i<data.players.length;i++)
        ctx.fillText(data.players[i].number,data.players[i].x,data.players[i].y);

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