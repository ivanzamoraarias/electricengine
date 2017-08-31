/**
 * Created by root on 8/29/17.
 */

console.log('Hello To Electric Engine Main Process');
var express = require('express');
var app=express();
var serv=require('http').Server(app);
app.get('/',function (req, res) {
    res.sendFile(__dirname+'/client/index.html');
});

app.use('/client',express.static(__dirname + 'client'));

serv.listen(2000);
console.log('Server Started at port 2000');

var socketList={};


//all the sintacxis for socket io , for receive and emit
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function (socket) {
    console.log('socket connection');

    socket.id= Math.random();
    socket.x=0;
    socket.y=0;
    socketList[socket.id]=socket;

    //receive a message type "happy" , with data=the actual messege
    socket.on('happy',function (data) {
        console.log('happy messege received'+ data.reason);
    });

    socket.emit('mes2',{
        mes:'mes dos'
    });
});

//game loop
setInterval(function () {

    for(var i in socketList)// the i will let the index of the object in the list
    {
        var s= socketList[i];
        s.x++;
        s.y++;

        s.emit('newPosition',{
            x:s.x,
            y:s.y
        });
    }
},1000/25);
