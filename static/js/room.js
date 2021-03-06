var nMessages = 0
var chart = undefined


var setHistory = function(turn){
  // Set the history to a turn in the game
  // Mind that a turn consist of each player throwing a volée
  var nPlayers = game.players.length
  var firstIndex = nPlayers * (turn - 1)
  var lastIndex = Math.min(firstIndex + nPlayers - 1, game.volees.length)
  var turnVolees = game.volees.slice(firstIndex , lastIndex + 1)// slice exlude last index!
  //update players scores
  turnVolees.forEach((volee, i) => {
    var playerCells = $('.player-cell-' + i)
    volee.previousScores.forEach((score, j) => {
      playerCells.filter('.score-' + j).html(score)
    });
  });
  //highlight matching volees in history
  $('.volee').removeClass('list-group-item-secondary')
  for(var i=firstIndex; i < lastIndex + 1; i++) {
    $('.round-' + i).addClass('list-group-item-secondary')
  }
  // and scroll
  $('#volees').scrollTop(
    $('.round-' + firstIndex).offset().top - $('#volees').offset().top + $('#volees').scrollTop() - ($('#volees').height()/2)
  );

}

var dartsToString = function(darts, preview=false){
  // affichage d'une voléé. Retourne un string (html)
  html=""
  if (darts.length == 0){
    html += '<span class="badge badge-warning">Fromage</span>'
  } else {
    darts.forEach((dart, i) => {
      if (i > 0){
        html += ', '
      }
      if (dart.numeroTape == 6){
        // Boulle!
        var classList = ['', 'success', 'danger'];
      } else {
        var classList = ['', 'secondary', 'info', 'primary']
      }
      html += '<span class="badge badge-' + classList[dart.combo]
      if (preview){
        html += ' dart- "data'
      }
      html +=  '"">'
      html +=  dart.combo + ' × ' + game.scoresList[dart.numeroTape] + '</span>'
    });
  }
  return html
}

var refreshForGameState = function(){
  // On cache/affiche les élèments en fonction du game_state
  if (game.state == 0){
    $('.game-state-1').addClass('d-none');
    $('.game-state-2').addClass('d-none');
    $('.game-state-3').addClass('d-none');
    $('.game-state-0').removeClass('d-none');
  }
  else if (game.state == 2) {
    $('.game-state-0').addClass('d-none');
    $('.game-state-1').addClass('d-none');
    $('.game-state-3').addClass('d-none');
    $('.game-state-2').removeClass('d-none');
  }
  else if (game.state == 3) {
    $('.game-state-0').addClass('d-none');
    $('.game-state-1').addClass('d-none');
    $('.game-state-2').addClass('d-none');
    $('.game-state-3').removeClass('d-none');
  }
  // affiche elements en fonction du auth
  if (auth){
    $('#login').addClass('d-none')
    $('.auth').removeClass('d-none')
  } else {
    $('.auth').addClass('d-none')
  }
}

var refresPlayersTable = function(){
  //recharge le tableau principal avec les nouvelles données
  if (game.state == 0 ){
    template = templates.tableState0
    var html = ejs.render(template, { game: game });
    $('#game-col').html(html);
  }
  if (game.state == 2){
    template = templates.tableState2
    var html = ejs.render(template, { game: game });
    $('#game-col').html(html);

    var activePlayerIndex = game.players.findIndex(player => player.name == game.activePlayer.name)
    $('.player-'+ activePlayerIndex + '-cell').addClass('table-active')
    $('#active-player-name').html(game.activePlayer.name);
  }
  if (game.state == 3){
    template = templates.tableState3
    var html = ejs.render(template, { game: game });
    $('#game-col').html(html);
    chart = chartFromGame($('#chart-canvas'), game, 'batons')
    $('.nav-link').click(function(e){
      chart.destroy()
      chart = chartFromGame($('#chart-canvas'), game, $(e.target).data('chart'))
    });
  }
}

var refreshVolees = function(){
  var html = ""
  for (var i = game.volees.length - 1; i >= 0; i--) {
    var v = game.volees[i]
    var round = i + 1
    html += '<li class="list-group-item volee round-' + i + '"><span class="alert alert-secondary">';
    html +=  round + '</span> <b>' + v.playerName + '</b>: ';
    html += dartsToString(v.darts)
    html +='</li>'
  }
  $('#volees').html(html)
}

var updateVoleePreview = function(darts){
  // met à jour le résumé de la volée
  var html = '<li class="list-group-item">' + dartsToString(darts) + '</li>'
  $('#volee-preview-list').html(html)
  // Si la volee à plus de 3 lancés, on ajoute la classe warning
  if (darts.length > 3){
    $('#volee-preview-card').addClass("border-warning")
    $('#valide-volee').prop("disabled", true);
    $('#valide-volee').removeClass("btn-success")
    $('#valide-volee').addClass("btn-secondary")
  }
  else{
    $('#volee-preview-card').removeClass("border-warning")
    if (darts.length >0){
      $('#volee-preview-card').addClass("border-success")
    }
    $('#valide-volee').prop("disabled", false);
    $('#valide-volee').addClass("btn-success")
    $('#valide-volee').removeClass("btn-secondary")
  }

}

var DartButtonsclick = function(el){
  // perd le focus pour que l'utilisateur puisse appuyer sur entrer
  $(el).blur()
  // le nombre initial de fois qu'il a tapé la zone dans ce volee
  var n_initial = $(el).data("n")
  // le numéro tapé
  var numeroTape = $(el).data("value")
  // simple? double? triple!
  var combo = $(el).data("combo")
  var dart = {numeroTape: numeroTape, combo: combo}
  // si il a déja tapé 3 fois le machin, on remet à 0
  if (n_initial == 3){
    $(el).html("&nbsp;")
    $(el).data("n", 0)
    // enlève tous les numeroTape x combo de la volee
    darts = darts.filter(l => (l.numeroTape !== numeroTape) || (l.combo !== combo) );
    updateVoleePreview(darts)
    return false
  }

  darts.push(dart)
  // met à jour le bouton
  $(el).data("n", n_initial +1)
  $(el).html(n_initial +1)
  updateVoleePreview(darts)

};

$(function () {
  refreshForGameState();
  var socket = io();
  socket.emit('join-room', room.id);

  $('#password-form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('login', {password: $('#password').val(), roomId: room.id} );
    $('#password').val('');
    return false;
  });

  $('#new-player').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('new-player', {playerName: $('#new-player-name').val(), roomId: room.id} );
    $('#new-player-name').val('');
    return false;
  });

  $('#remove-player').click(function(e){
    socket.emit('remove-player', {roomId: room.id});
    return false;
  });

  $('#start-game').click(function(e){
    socket.emit('start-game', {roomId: room.id});
    return false;
  });
  $('#valide-volee').click(function(e){
    socket.emit('valide-volee', {darts: darts, roomId: room.id});
    return false;
  });

  $('#fromage').click(function(e){
    darts = []
    socket.emit('valide-volee', {darts: darts, roomId: room.id});
    return false;
  });

  $('#cancel-volee').click(function(e){
    socket.emit('cancel-volee', {roomId: room.id});
    return false;
  });

  $('#new-game').click(function(e){
    socket.emit('new-game', {roomId: room.id});
    return false;
  });

  $('#shuffle-players').click(function(e){
    socket.emit('shuffle-players', {roomId: room.id});
    return false;
  });

  $('#jitsi-connect-button').click(function(){
    socket.emit('jitsi-connect', {roomId: room.id});
  });

  // Pressing return key will validate volée

  $(document).on('keypress',function(e) {
    if(e.which == 13) {
      if (game.state == 2 && e.target.id != 'password'){
        // Le password est le seul input texte de game.state2
        socket.emit('valide-volee', {darts: darts, roomId: room.id});
        return false;
      }
    }
  });

  // socket receiver

  socket.on('login', function(gameFromServer){
    game = gameFromServer;
    auth = true;
    $('#alert').html(game.alert)
    refreshForGameState()
  });

  socket.on('change-players', function(game_from_server){
    game = game_from_server;
    $('#alert').html(game.alert)
    refresPlayersTable()
  });

  socket.on('update-game', function(gameFromServer){
    game = gameFromServer;
    darts = []
    updateVoleePreview(darts)
    $('#alert').html(game.alert)
    refresPlayersTable()
    refreshForGameState()
    refreshVolees()
  });

  socket.on('jitsi-connect', function(datas){
    var jitsiContainer = document.getElementById("jitsi-container");
    $('#jitsi-connect-button').addClass('d-none');
    jitsiConnect(jitsiContainer, datas.jitsiRoom);
  });

  socket.on('disconnect',function(reason){
    var alert = '<div class="spinner-border text-warning float-left" role="status">'
    alert += '<span class="sr-only">Loading...</span></div>'
    alert += ' Connection au serveur perdue. En attente de reconnection.'
    $('#alert').html(alert)
  });

  socket.on('new-message',function(message){
    nMessages += 1
    var html = '<span class="oi oi-comment-square"></span><span> ' + nMessages + '</span>'
    var tooltip = nMessages + ' nouveaux messages dans le lobby'
    $('#chat-indicator').attr('title', tooltip)
    $('#chat-indicator').html(html)
    $('#chat-indicator').removeClass('d-none')
  });

  var splitobj = Split(["#game-col","#jitsi-container"], {
    elementStyle: function (dimension, size, gutterSize) {
      $(window).trigger('resize'); // Optional
      return {'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'}
    },
    gutterStyle: function (dimension, gutterSize) { return {'flex-basis':  gutterSize + 'px'} },
    gutter: (index, direction) => {
      const gutter = document.createElement('div')
      gutter.className = `gutter gutter-${direction} d-none d-md-block`
      return gutter
    },
    sizes: [50,50],
    minSize: [500,0],
    gutterSize: 20,
    cursor: 'col-resize',
  });
});
