var Game = require('./game.js')

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

class Rooms extends Array {
  createNewRoom(name, password){
    // create a new room with the given name and password.
    if (this.some(r => r.name == name)){
      // we already have a room with the same name.
      return false;
    }
    var room = new Room(this.length, name, password);
    this.push(room)
    return room;
  }

  toClient(){
    // prepare all rooms to be send to clients
    return this.map(r => r.toClient())
  }

  getRoomById(id){
    return this.find(r => r.id == id)
  }
}



module.exports = Rooms;
