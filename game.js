function Game(){
    // game state:
    // 0: setting players
    // 1: waiting for players approvals
    // 2: playing
    // 3: game finished
    this.state = 0;
    // player = { name: name, scores: scores };
    // where scores is a list of 8 int: 20, 19, 18, 17, 16, 15, 25, S
    this.players = [];
    // dart ={numeroTape: numeroTape, combo: combo}
    // volee = [{playerName: name, darts: [darts], previousScores: scores]
    this.volees = [];
    this.activePlayer = null;
    this.scoresList = [ 20, 19, 18, 17, 16, 15, 25, 'S'];
    this.alert = '<span class="oi oi-heart float-left" title="Bienvenu" aria-hidden="true"></span> Bienvenue!';

    this.createPlayer = function(name){
      // create a new player with the given name and add it to players list.
      // change the alert
      // A player have 2 fields: name and scores
      // if name is already taken, we just return false
      // test if we already have a player with this name
      if(this.players.some(e => e.name == name)) {
        return false;
      }
      // scores will be a list of 8 int: 20, 19, 18, 17, 16, 15, 25, S
      var scores = [];
      for (var i = 0; i <= 7; i++) {
        scores.push(0);
      };
      var player = { name: name, scores: scores };
      this.players.push(player)
      this.alert = '<span class="oi oi-plus float-left" title="nouveau joueur" aria-hidden="true"></span> Nouveau joueur: <b>' + player.name + '</b>'
      return true;
    };

    this.removePlayer = function(){
      var player = this.players.pop()
      this.alert = '<span class="oi oi-trash float-left" title="trash" aria-hidden="true"></span> Le joueur <b>' + player.name + '</b> a été supprimé.'
    };

    this.scoreVolee = function(darts){
      this.volees.push({
        playerName: this.activePlayer.name,
        darts:darts,
        previousScores: JSON.parse(JSON.stringify(this.activePlayer.scores))
      });
      darts.forEach((dart) => {
        // on score chaque dart
        // dart ={numeroTape: numeroTape, combo: combo}
        n_initial = this.activePlayer.scores[dart.numeroTape]
        n = n_initial + dart.combo
        if (n > 3){
            // on test si quelqu'un d'autre à fermé le numeroTape
            // la boulle à une particularité: elle ne se ferme pas à plus de deux joueurs
            if (dart.numeroTape == 6 && this.players.length > 2){
              // c'est une boulle et on a plus de 2 joueurs
              this.activePlayer.scores[7] += (n-3) * this.scoresList[dart.numeroTape]
            }
            else if (!(this.players.some(p => (p.scores[dart.numeroTape] == 3) && (p !== this.activePlayer)))){
                this.activePlayer.scores[7] += (n-3) * this.scoresList[dart.numeroTape]
            }
            n = 3
        }
        this.activePlayer.scores[dart.numeroTape] = n
      });
      //test if this is over
      if ((this.activePlayer.scores.slice(0, 7).every(s => s == 3)) && (this.players.every(p => p.scores[7] <= this.activePlayer.scores[7]))){
        this.state = 3
        this.alert = '<span class="oi oi-badge float-left" aria-hidden="true"></span>Le gagnant est <b>' + this.activePlayer.name + '</b>!!!'
      } else {
        if (darts.length == 0) {
          alert = '<span class="oi oi-trash float-left" title="bell" aria-hidden="true"></span>'
        } else if (darts.length == 3) {
          alert = '<span class="oi oi-star float-left" title="pin" aria-hidden="true"></span>'
        } else {
          alert = '<span class="oi oi-pin float-left" title="pin" aria-hidden="true"></span>'
        }
        alert +=  'Le joueur <b>' + this.activePlayer.name + '</b> a fait: '
        alert += this.dartsToString(darts)
        this.alert = alert
      }
    };

    this.cancelVolee = function(){
      alert = '<span class="oi oi-action-undo float-left" title="undo" aria-hidden="true"></span>'
      if (this.volees.length == 0) {
        this.state = 0;
        this.alert = alert + ' Un problème ?'
        return true;
      }
      // si on est en stade 3, il faut retourner au stade 2
      this.state = 2
      // attention on pop la derniere volée
      var volee = this.volees.pop()
      alert += 'Annulation de la volée de <b>' + volee.playerName + '</b>: ' + this.dartsToString(volee.darts)
      this.alert = alert
      // set new activePlayer
      player = this.players.find(p => p.name == volee.playerName)
      this.activePlayer = player
      this.activePlayer.scores = volee.previousScores
    };

    this.getNextPlayer = function(){
      index = this.players.indexOf(this.activePlayer);
      if(index >= 0 && index < this.players.length - 1){
       nextPlayer = this.players[index + 1]
      }
      else{
       nextPlayer = this.players[0]
      }
      return nextPlayer
    }

    this.getPreviousPlayer = function(){
      index = this.players.indexOf(activePlayer);
      if(index > 0){
       previousPlayer = this.players[index - 1]
      }
      else{
       previousPlayer = this.players[this.players.length - 1]
      }
      return previousPlayer
    }

    this.startGame = function(){
      if (this.players.length > 0 ) {
        this.activePlayer = this.players[0];
        this.state = 2;
        this.alert = '<span class="oi oi-bell float-left" title="bell" aria-hidden="true"></span> La partie a commencée.'
        return true;
      } else{
        return false;
      }
    };

    this.dartsToString = function(darts){
        // affichage d'une voléé. Retourne un string (html)
        html=""
        if (darts.length == 0){
           html += '<span class="badge badge-warning">Fromage</span>'
        } else {
          darts.forEach((dart, i) => {
            if (i > 0){
              html += ', '
            }
            html += '<span class="badge badge-' + ['', 'secondary', 'primary', 'danger'][dart.combo] + '">'
            html +=  dart.combo + ' × ' + this.scoresList[dart.numeroTape] + '</span>'
          });
        }
        return html
    };

    // it seems methods are not passed to client anyway.
    // this.toClient = function(){
    //   // prepare datas to send to client. We just keep the needed methods.
    //   var game = {
    //     state: this.state,
    //     players: this.players,
    //     volees: this.volees,
    //     scoresList: this.scoresList,
    //     activePlayer: this.activePlayer,
    //     alert: this.alert,
    //     dartsToString: this.dartsToString
    //   }
    //   return game;
    // }


};
module.exports = Game
