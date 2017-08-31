/**
 * Created by root on 8/31/17.
 */

var Player = function(id){
    var self={
        x:250,
        y:250,
        id:id,
        number:""+Math.floor(10*Math.random())
    }
    return self;
}

//module.exports.PLayer=Player;