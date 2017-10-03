/**
 * Created by Ivan Zamora Arias on 8/29/17.
 */
var DEBUG= true;
//var playerClass= require('Player');

console.log('Welcome To Electric Engine Main Process');
var express = require('express');
var app=express();
var serv=require('http').Server(app);
app.get('/',function (req, res) {
    res.sendFile(__dirname+'/client/index.html');
});
app.get('/style.css', function(req, res) {
    res.sendFile(__dirname + "/style/style.css");
});
app.get('/clientScript.js',function(req,res){
    res.sendFile(__dirname + '/client/js/clientScript.js');

});
app.use('/client',express.static(__dirname + 'client'));

serv.listen(2000);
console.log('Server Started at port 2000');

var socketList={};
//var playerList={};


var GameObject= function(){

    var self={
        x:250,
        y:250,
        vx:0,
        vy:0,
        id:"",
        radious:10,
    }
    self.update=function(){
        self.updatePosition();
    }
    self.updatePosition=function(){
        self.y+=self.vy;
        self.x+=self.vx;

    }
    self.getDistanceToObject=function(object){
        var dx=self.x-object.x;
        var dy=self.y-object.y;
        var distance = Math.sqrt(dx*dx+dy*dy);
        return distance;
    }
    return self;
};

//Player Class
var Player = function(id){
    var self=GameObject();
    self.id=id;
    self.number=""+Math.floor(10*Math.random());
    self.pressingRight=false;
    self.pressingLeft=false;
    self.pressingUp=false;
    self.pressingDown=false;
    self.pressAttack=false;
    self.mouseAngle=0;
    self.maxSpeed=10;
    self.radious=10;

    var parentUpdate= self.update;
    self.update=function(){
        self.updateVelocity();
        parentUpdate();

        if(self.pressAttack)
        {
           self.shootBullet(self.mouseAngle);
        }
    }
    //shoot bullet
    self.shootBullet= function (angle) {
        var b=Bullet(self,angle);
        b.x=self.x;
        b.y=self.y;
    }

    self.updateVelocity=function(){
        if(self.pressingRight)
            self.vx = self.maxSpeed;
        else if(self.pressingLeft)
            self.vx = -self.maxSpeed;
        else
            self.vx=0;
        if(self.pressingUp)
            self.vy = -self.maxSpeed;
        else if(self.pressingDown)
            self.vy = self.maxSpeed;
        else self.vy=0;
    }

    //static variable for contain all the players
    Player.List[id]=self;
    return self;
}
//Static Variable
Player.List={};
//Static Function
Player.onConnect=function(socket){
    var player = Player(socket.id);
    socket.on('keyPress', function (data) {
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
        else if(data.inputId=='click')
            player.pressAttack=data.state;
        else if(data.inputId=='mousemove')
            player.mouseAngle=data.angle;
    });
}

Player.onDisconnect=function(socket){
    delete  Player.List[socket.id];
}
Player.update=function(){
    var objectList=[];
    for(var i in Player.List)// the i will let the index of the object in the list
    {
        var player= Player.List[i];
        player.update();
        objectList.push({
            x:player.x,
            y:player.y,
            number:player.number
        });

    }
    return objectList;
}

//Bullet Class
var Bullet= function(parent, angle){
    var self=GameObject();
    self.id=Math.random();
    self.maxSpeed=10;
    self.vx=Math.cos(angle/180*Math.PI)*self.maxSpeed;//10 es igual a self.maxspeed
    self.vy=Math.sin(angle/180*Math.PI)*self.maxSpeed;

    self.timer=0;
    self.toRemove=false;
    self.parentObject = parent;
    self.radious=5;
    var parentUpdate= self.update;
    self.getObjectOnCollisionDetection= function () {
        for(var i in Player.List) {
            var other = Player.List[i];
            if (other.id != parent.id) {
                var dis=self.getDistanceToObject(other);
                var radif=self.radious + other.radious;
                //console.log('---- dis '+dis+' dif rad'+radif+'  xO '+other.x+'  yO'+other.y+' x '+self.x+' y '+self.y);
                if (self.getDistanceToObject(other) < (self.radious + other.radious)) {
                    //console.log('Colision con ' + other.id );
                    return other;
                }
            }

        }
        return null;
    }
    self.bulletEventHandler= function () {
        var objectCollided=self.getObjectOnCollisionDetection();
        if (objectCollided != null)
            self.toRemove=true;
    }

    self.update=function(){
        if(self.timer++ > 100 )
            self.toRemove=true;
        parentUpdate();
        self.bulletEventHandler();

    }
    Bullet.List[self.id]=self;
    return self;
}
Bullet.List={};
Bullet.getListSize= function () {
    var n=0;
    for(var i in this.List)
        n++;
    return n;
}

Bullet.update=function(){

    var objectList=[];
    for(var i in Bullet.List)// the i will let the index of the object in the list
    {
        var bullet= Bullet.List[i];
        bullet.update();
        if(bullet.toRemove) {
            delete Bullet.List[i];
        }
        else {
            objectList.push({
                x: bullet.x,
                y: bullet.y
            });
        }
    }
    return objectList;
}

//all the sintacxis for socket io , for receive and emit
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function (socket) {
    console.log('socket connection');

    socket.id= Math.random();
    socketList[socket.id]=socket;
    Player.onConnect(socket);

    socket.on('disconnect',function(){
        delete socketList[socket.id];
        Player.onDisconnect(socket);
    });
    
    socket.on('sendMessageToChatServer', function (message) {
        var playerName= (''+socket.id).slice(2,7);
        for(var i in socketList)
        {
            socketList[i].emit('addToChat', playerName+': '+message);
        }

    });
    socket.on("sendEvalMessage", function (message) {
        if(!DEBUG)
            return;
        var responce= eval(message);
        socket.emit('sendEvalAnswer',responce);

    });
});

//game loop
setInterval(function () {
    var objectList={
      players: Player.update(),
      bullets: Bullet.update()
    }

    //var objectList=Player.update();
    for(var i in socketList){
        var s= socketList[i];
        s.emit('newPosition',objectList);
    }
},1000/25);
