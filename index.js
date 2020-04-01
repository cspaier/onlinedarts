var express=require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static('static/'));
// set the view engine to ejs
app.set('view engine', 'ejs');

var players = [];
var scoresList = [ 20, 19, 18, 17, 16, 15, 'B', 'S'];
// game state:
// 0: setting players
// 1: waiting for players approvals
// 2: playing
// 3: game finished
var game_state = 0;
// get table template as string:
fs = require('fs'),
table_template = fs.readFileSync(__dirname + '/views/partials/table.ejs', 'utf-8'),


createPlayer = function(name){
  // test if we already have a player with this name
  if(players.some(e => e.name == name)) {
    return false;
  }
  // scores will be a list of 8 int: 20, 19, 18, 17, 16, 15, B, S
  var scores = [];
  for (var i = 0; i <= 7; i++) {
    scores.push(0);
  };
  var player = { name: name, scores: scores };
  return player
};


app.get('/', function(req, res){
  res.render('index', {players: players, scoresList: scoresList, table_template: table_template, game_state: game_state});
});


io.on('connection', function(socket){
  socket.on('new-player', function(playerName){
    player = createPlayer(playerName);
    // createPlayer will return False if playerName is already taken
    if (player){
      players.push(player)
    }
    io.emit('change-players', players);
  });

  socket.on('remove-player', function(playerName){
    players.pop()
    io.emit('change-players', players);
  });

  socket.on('start-game', function(){
    game_state = 2;
    io.emit('change-game-state', game_state);
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
http.listen(port);
