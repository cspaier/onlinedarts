var Game = require('./game.js')

function Room(name, password){
  this.name = name;
  this.sockets = [];
  this.jitsiUrl = "";
  this.password = password;
  this.game = new Game;
};

module.exports = Room;
