/**
 * Created by root on 8/29/17.
 */

//var playerClass= require('Player');

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
var playerList={};

var Player = function(id){
    var self={
        x:250,
        y:250,
        id:id,
        number:""+Math.floor(10*Math.random()),

        pressingRight:false,
        pressingLeft:false,
        pressingUp:false,
        pressingDown:false,

        maxSpeed:10
    }
    self.updatePosition=function(){
        if(self.pressingRight)
            self.x += self.maxSpeed;
        if(self.pressingLeft)
            self.x -= self.maxSpeed;
        if(self.pressingUp)
            self.y -= self.maxSpeed;
        if(self.pressingDown)
            self.y += self.maxSpeed;

    }
    return self;
}



//all the sintacxis for socket io , for receive and emit
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function (socket) {
    console.log('socket connection');

    socket.id= Math.random();
    socketList[socket.id]=socket;

    var player = Player(socket.id);
    playerList[socket.id]= player;

    socket.on('disconnect',function(){
        delete socketList[socket.id];
        delete  playerList[socket.id];
    });
    socket.on('keypress', function (data) {
        switch (data.input){
            case 'left':
                player.pressingLeft=data.state;
            case 'right':
                player.pressingLeft=data.state;
            case 'up':
                player.pressingLeft=data.state;
            case 'down':
                player.pressingLeft=data.state;

        }
    })


});

//game loop
setInterval(function () {
    var objectList=[];
    for(var i in playerList)// the i will let the index of the object in the list
    {
        var player= playerList[i];
        player.updatePosition();
        objectList.push({
            x:player.x,
            y:player.y,
            number:player.number
        });

    }
    for(var i in socketList){
        var s= socketList[i];
        s.emit('newPosition',objectList);
    }
},1000/25);
