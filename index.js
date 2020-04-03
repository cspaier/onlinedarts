var express=require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static('static/'));
var ejs = require('ejs');
// set the view engine to ejs
app.set('view engine', 'ejs');
var Game = require('./game.js')
var RoomExports = require('./room.js')
var Room = RoomExports.Room
var createNewRoom = RoomExports.createNewRoom

// On va passer des templates au client
fs = require('fs')
var roomTemplates = {
  tableState0: fs.readFileSync(__dirname + '/views/partials/table-state-0.ejs', 'utf-8'),
  tableState2: fs.readFileSync(__dirname + '/views/partials/table-state-2.ejs', 'utf-8'),
}
var homeTemplates = {
  cardRoom: fs.readFileSync(__dirname + '/views/partials/card-room.ejs', 'utf-8'),
}
var game = new Game();
var rooms = [];

// Les vues

app.get('/', function(req, res){
  res.render('home', {rooms: rooms, templates: homeTemplates});
});

app.get('/room/:roomId', function(req, res){
  var room = rooms.find(r => r.id = req.params.roomId)
  if (room === undefined){
    res.redirect('/');
  }else{
  res.render('room', {room:room.toClient(), game: room.game, templates: roomTemplates});
  }
});


// sockets

io.on('connection', function(socket){
  socket.join('home');
  io.emit('update-rooms', rooms.map(r => r.toClient()));

  socket.on('join-room', function(roomId){
    io.emit('update-game', game);
  });

  // home

  socket.on('create-room', function(datas){
    var room = createNewRoom(datas.roomName, datas.password, rooms)
    if (!room){
      io.emit('update-rooms', rooms.map(r => r.toClient()));
      return false;
    }
    rooms.push(room);
    io.emit('update-rooms', rooms.map(r => r.toClient()));
  });


  // game things
  // all io.emit will pass game object. This way we are clear game state is always same for all clients
  socket.on('new-player', function(playerName){
    game.createPlayer(playerName);
    io.emit('change-players', game);
  });

  socket.on('remove-player', function(playerName){
    game.removePlayer();
    io.emit('change-players', game);
  });

  socket.on('start-game', function(){
    game.startGame()
    io.emit('change-game-state', game);
  });

  socket.on('valide-volee', function(darts){
    if (game.state !== 2){
      return false
    }
    game.scoreVolee(darts)
    if (game.state == 3){
      // game is finished!
      io.emit('change-game-state', game);
    } else {
      game.activePlayer = game.getNextPlayer()
      io.emit('update-game', game);
    }
  });

  socket.on('cancel-volee', function(){
    game.cancelVolee()
    io.emit('update-game', game)
  });

  socket.on('new-game', function(){
    game = new Game()
    io.emit('change-game-state', game)
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
http.listen(port);
