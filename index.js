var express=require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static('static/'));
var ejs = require('ejs');
// set the view engine to ejs
app.set('view engine', 'ejs');

// set up readis
const redis = require("redis");
var client = redis.createClient();
client.on('error', function (err) {
  console.log('Error ' + err);
});

var Game = require('./game.js')
var Rooms = require('./rooms.js')
var Chat = require('./chat.js')
var rooms = new Rooms
var chat = new Chat

// On va passer des templates au client
fs = require('fs')
var roomTemplates = {
  tableState0: fs.readFileSync(__dirname + '/views/partials/table-state-0.ejs', 'utf-8'),
  tableState2: fs.readFileSync(__dirname + '/views/partials/table-state-2.ejs', 'utf-8'),
  tableState3: fs.readFileSync(__dirname + '/views/partials/table-state-3.ejs', 'utf-8'),
}
var homeTemplates = {
  cardRoom: fs.readFileSync(__dirname + '/views/partials/card-room.ejs', 'utf-8'),
  messages: fs.readFileSync(__dirname + '/views/partials/messages.ejs', 'utf-8'),
}

// save rooms object to redis a json
var save = function(object){
  client.set('rooms', JSON.stringify(object));
}

// get backup on app start
client.get('rooms',(err, json)=>{
  if(err){
    throw err;
  }

  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 8000;
  }
  rooms.populateFromJson(json)
  http.listen(port);
})


// Les vues

app.get('/', function(req, res){
  // clear inactive rooms
  rooms = rooms.cleanInactives()
  save(rooms)
  res.render('home', {rooms: rooms.toClient(), templates: homeTemplates, chat: chat});
});

app.get('/room/:roomId', function(req, res){
  var room = rooms.getRoomById(req.params.roomId)
  if (room == undefined){
    res.redirect('/');
  }else{
    res.render('room', {room:room.toClient(), game: room.game, templates: roomTemplates});
  }
});

// sockets

io.on('connection', function(socket){

  // connection to home
  socket.on('join-home', function(){
    var user = chat.createUser(socket.id)
    socket.join('home');
    io.to(socket.id).emit('new-name', user.name)
    io.to(socket.id).emit('new-message', chat)
    io.to('home').emit('update-names', chat)
    io.to(socket.id).emit('update-rooms', rooms.toClient());
  });

  // connection to a room
  socket.on('join-room', function(roomId){
    var room = rooms.getRoomById(roomId)
    if (room == undefined){
      return false
    }
    socket.join(room.id)
    socket.leave('home')
    io.to(socket.id).emit('update-game', room.game);
  });

  socket.on('create-room', function(datas){
    rooms.createNewRoom(datas.roomName, datas.password)
    io.to('home').emit('update-rooms', rooms.toClient());
    save(rooms)
  });

  // game things
  // all io.emit will pass game object. This way we are clear game state is always same for all clients
  socket.on('login', function(datas){
    var room = rooms.getRoomById(datas.roomId)
    if (room == undefined){
      return false
    }
    // clean sockets list
    room.cleanSockets(io.sockets.clients().connected);
    if (room.login(datas.password, socket.id)){
      // login successfull
      io.to(socket.id).emit('login', room.game);
    }
    return false
  });

  socket.on('new-player', function(datas){
    var room = rooms.getRoomAndCheckAuth(datas.roomId, socket.id)
    if (!room){
      return false
    }
    room.game.createPlayer(datas.playerName);
    io.to(room.id).emit('change-players', room.game);
    io.to('home').emit('update-rooms', rooms.toClient());
    save(rooms)
  });

  socket.on('remove-player', function(datas){
    var room = rooms.getRoomAndCheckAuth(datas.roomId, socket.id)
    if (!room){
      return false
    }
    room.game.removePlayer();
    io.to(room.id).emit('change-players', room.game);
    io.to('home').emit('update-rooms', rooms.toClient());
    save(rooms)
  });

  socket.on('start-game', function(datas){
    var room = rooms.getRoomAndCheckAuth(datas.roomId, socket.id)
    if (!room){
      return false
    }
    room.game.startGame()
    io.to(room.id).emit('update-game', room.game);
    io.to('home').emit('update-rooms', rooms.toClient());
    save(rooms)
  });

  socket.on('valide-volee', function(datas){
    var room = rooms.getRoomAndCheckAuth(datas.roomId, socket.id)
    if (!room){
      return false
    }
    var darts = datas.darts
    var game = room.game
    if (game.state !== 2){
      return false
    }
    game.scoreVolee(darts)
    if (game.state == 3){
      // game is finished!
      io.to(room.id).emit('update-game', game);
      io.to('home').emit('update-rooms', rooms.toClient());

    } else {
      game.activePlayer = game.getNextPlayer()
      io.to(room.id).emit('update-game', game);
      io.to('home').emit('update-rooms', rooms.toClient());
    }
    save(rooms)
  });

  socket.on('cancel-volee', function(datas){
    var room = rooms.getRoomAndCheckAuth(datas.roomId, socket.id)
    if (!room){
      return false
    }
    room.game.cancelVolee()
    io.to(room.id).emit('update-game', room.game)
    io.to('home').emit('update-rooms', rooms.toClient());
    save(rooms)
  });

  socket.on('new-game', function(datas){
    var room = rooms.getRoomAndCheckAuth(datas.roomId, socket.id)
    if (!room){
      return false
    }
    room.game = new Game()
    io.to(room.id).emit('update-game', room.game)
    save(rooms)
  });
  socket.on('shuffle-players', function(datas){
    var room = rooms.getRoomAndCheckAuth(datas.roomId, socket.id)
    if (!room){
      return false
    }
    room.game.shufflePlayers()
    io.to(room.id).emit('update-game', room.game)
    io.to('home').emit('update-rooms', rooms.toClient());
    save(rooms)
  });

  socket.on('jitsi-connect', function(datas){
    var room = rooms.getRoomAndCheckAuth(datas.roomId, socket.id)
    if (!room){
      return false
    }
    io.to(socket.id).emit('jitsi-connect', {jitsiRoom: room.jitsiRoom})
    io.to('home').emit('update-rooms', rooms.toClient());
  });

  // Chat events
  socket.on('change-name', function(name){
    if (chat.changeName(name, socket.id)){
      io.to(socket.id).emit('new-name', name);
      io.to('home').emit('update-names', chat);
    }
  });

  socket.on('new-message', function(message){
    chat.newMessage(message, socket.id)
    io.emit('new-message', chat)
  });

  socket.on('disconnect', function(){
    chat.removeUser(socket.id)
  });

});
