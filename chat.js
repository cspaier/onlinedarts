function Chat(){
  this.users = []
  this.messages = []

  this.populateFromJson = function(json){
    if (json != undefined){
      var jsonChat = JSON.parse(json)
      this.users = jsonChat.users
      this.messages = jsonChat.messages
    }
  }

  this.cleanUsers = function(sockets){
    // sockets is the list of connected sockets (auth or not)
    // we remove all disconnected sockets from this.users
    this.users = this.users.filter(u => u.id in sockets)
  }
  
  this.newMessage = function(messageText, socketId){
    var user = this.getUserById(socketId)
    if (user == undefined){
      return false
    }
    var message = {'text': messageText, 'userName':user.name, date: Date.now()}
    this.messages.push(message)
    // keep only last 200 messages
    this.messages = this.messages.slice(-200)
    return message
  }

  this.createUser = function(socketId){
    var userNames = this.users.map(u => u.name)
    // guest names are darts champions from https://en.wikipedia.org/wiki/PDC_World_Darts_Championship
    var guestNames = ['P. Taylor', 'P. Wright', 'M. van Gerwen', 'R. Cross', 'G. Durrant', 'A. Lewis',
    'M. smith', 'G. Andersen', 'D. Priestley', 'R. Harrington', 'P. Manley', 'K. Shepherd']

    guestNames = guestNames.filter(name => !(userNames.includes(name)))
    // if all guestnames are taken we use guest-n
    if (guestNames.length == 0){
      var guestName = 'guest-' + userNames.length
    } else {
      var guestName = guestNames[Math.floor(Math.random() * guestNames.length)]
    }
    var user = new User(guestName, socketId)
    this.users.push(user)
    return user
  }

  this.removeUser = function(socketId){
    this.users = this.users.filter(user => user.id != socketId)
  }

  this.changeName = function(name, socketId){
    var user = this.getUserById(socketId)
    if (user == undefined){
      return false
    }
    user.name = name
    return true
  }

  this.getUserById = function(socketId){
    return this.users.find(u => u.id == socketId)
  }
}

function User(userName, socketId){
  this.name = userName
  this.id = socketId
}

module.exports = Chat;
