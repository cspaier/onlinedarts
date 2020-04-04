var Game = require('./game.js')
const { v4: uuidv4 } = require('uuid');

function Room(id, name, password){
  this.name = name;
  this.sockets = [];
  this.jitsiRoom = uuidv4();
  this.password = password;
  this.game = new Game;
  this.id = id;
  this.toClient = function(){
    return {
      name: this.name,
      game: this.game,
      public: this.password.length == 0,
      id: this.id,
    }
  }

  this.login = function(password, id){
    if (password == this.password){
      this.sockets.push(id);
      return true;
    } else {
      return false;
    }
  }

  this.isAuth = function(id){
    return (this.password.length == 0) || (this.sockets.includes(id))
  }
  this.cleanSockets = function(sockets){
    // sockets is the list of connected sockets (auth or not)
    // we remove all disconnected sockets from room.sockects
    this.sockets = this.sockets.filter(s => s in sockets)
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

  getRoomAndCheckAuth(roomId, socketId){
    // try to get room by its id and check if sockit is auth
    // returns the room if both check pass and false otherwise
    var room = this.getRoomById(roomId)
    if ((room != undefined) && (room.isAuth(socketId))){
      return room
    } else {
      return false
    }
  }
}



module.exports = Rooms;
