var express=require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static('static/'));
// set the view engine to ejs
app.set('view engine', 'ejs');


// game state:
// 0: setting players
// 1: waiting for players approvals
// 2: playing
// 3: game finished

// get table template as string:
fs = require('fs')
templates = {
  tableState0: fs.readFileSync(__dirname + '/views/partials/table-state-0.ejs', 'utf-8'),
  tableState2: fs.readFileSync(__dirname + '/views/partials/table-state-2.ejs', 'utf-8')
}
// dart ={numeroTape: numeroTape, combo: combo}
// volee = [{player: name, volee: [darts]]
var volees = []

var game = {
  // game state:
  // 0: setting players
  // 1: waiting for players approvals
  // 2: playing
  // 3: game finished
  state: 0,
  // player = { name: name, scores: scores };
  // where scores is a list of 8 int: 20, 19, 18, 17, 16, 15, 25, S
  players: [],
  // dart ={numeroTape: numeroTape, combo: combo}
  // volee = [{player: name, volee: [darts]]
  volees: [],
  activePlayer: null,
  scoresList: [ 20, 19, 18, 17, 16, 15, 25, 'S'],
}

var createPlayer = function(name){
  // test if we already have a player with this name
  if(game.players.some(e => e.name == name)) {
    return false;
  }
  // scores will be a list of 8 int: 20, 19, 18, 17, 16, 15, 25, S
  var scores = [];
  for (var i = 0; i <= 7; i++) {
    scores.push(0);
  };
  var player = { name: name, scores: scores };
  return player
};

var scoreVolee = function(volee){
  volee.forEach((dart) => {
    // on score chaque dart
    // dart ={numeroTape: numeroTape, combo: combo}
    n_initial = game.activePlayer.scores[dart.numeroTape]
    n = n_initial + dart.combo
    if (n > 3){
        // on test si quelqu'un d'autre à fermé le numeroTape
        // la boulle à une particularité: elle ne se ferme pas à plus de deux joueurs
        if (dart.numeroTape == 6 && game.players.length > 2){
          // c'est une boulle et on a plus de 2 joueurs
          game.activePlayer.scores[7] += (n-3) * game.scoresList[dart.numeroTape]
        }
        else if (!(game.players.some(p => (p.scores[dart.numeroTape] == 3) && (p !== game.activePlayer)))){
            game.activePlayer.scores[7] += (n-3) * game.scoresList[dart.numeroTape]
        }
        n = 3
    }
    game.activePlayer.scores[dart.numeroTape] = n
    // test if game is over

  });

}

var getNextPlayer = function(activePlayer){
  index = game.players.indexOf(activePlayer);
  if(index >= 0 && index < game.players.length - 1){
   nextPlayer = game.players[index + 1]
  }
  else{
   nextPlayer = game.players[0]
  }
  return nextPlayer
}

var getPreviousPlayer = function(activePlayer){
  index = game.players.indexOf(activePlayer);
  if(index > 0){
   previousPlayer = game.players[index - 1]
  }
  else{
   previousPlayer = game.players[game.players.length - 1]
  }
  return previousPlayer
}

// La vue
app.get('/', function(req, res){
  res.render('index', {game: game, templates: templates});
});


io.on('connection', function(socket){
  io.emit('update-game', game);
  // all io.emit will return game object. This way we are clear game state is always same for all clients
  socket.on('new-player', function(playerName){
    player = createPlayer(playerName);
    // createPlayer will return False if playerName is already taken
    if (player){
      game.players.push(player)
    }
    io.emit('change-players', game);
  });

  socket.on('remove-player', function(playerName){
    game.players.pop()
    io.emit('change-players', game);
  });

  socket.on('start-game', function(){
    game.activePlayer = game.players[0];
    game.state = 2;
    io.emit('change-game-state', game);
  });

  socket.on('valide-volee', function(volee){
    if (game.state !== 2){
      return false
    }
    game.volees.push({playerName: game.activePlayer.name, volee:volee, previousScores: JSON.parse(JSON.stringify(game.activePlayer.scores))});
    scoreVolee(volee)
    game.activePlayer = getNextPlayer(game.activePlayer)
    io.emit('update-game', game);
  });

  socket.on('cancel-volee', function(){
    if (game.volees.length == 0) {
      return false
    }
    volee = game.volees.pop()
    player = game.players.find(p => p.name == volee.playerName)
    game.activePlayer = player
    // attention on pop la derniere volée
    game.activePlayer.scores = volee.previousScores
    io.emit('update-game', game)
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
http.listen(port);
