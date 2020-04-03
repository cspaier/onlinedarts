var Game = require('./game.js')

var createNewRoom= function(name, password, rooms){

  if (rooms.some(r => r.name == name)){
    // we already have a room with the same name.
    return false;
  }
  room = new Room(rooms.length, name, password);
  return room;
}

function Room(id, name, password){
  this.name = name;
  this.sockets = [];
  this.jitsiUrl = "";
  this.password = password;
  this.game = new Game;
  this.id = id;
  this.toClient = function(){
    return {
      name: this.name,
      game: this.game,
      private: this.password.length > 0,
      id: this.id
  }
  }
  this.isAuth = function(id){
    return (this.password.length == 0) || (this.sockets.includes(id))
  }
};

module.exports = {Room:Room, createNewRoom: createNewRoom};
