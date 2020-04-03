var express=require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static('static/'));
var ejs = require('ejs');
// set the view engine to ejs
app.set('view engine', 'ejs');
var Game = require('./game.js')

// get table template as string:
fs = require('fs')
templates = {
  tableState0: fs.readFileSync(__dirname + '/views/partials/table-state-0.ejs', 'utf-8'),
  tableState2: fs.readFileSync(__dirname + '/views/partials/table-state-2.ejs', 'utf-8'),
}

var game = new Game();

// La vue
app.get('/', function(req, res){
  res.render('index', {game: game, templates: templates});
});


io.on('connection', function(socket){
  io.emit('update-game', game);
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
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
http.listen(port);
