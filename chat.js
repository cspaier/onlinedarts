function Chat(){
  this.users = []
  this.userNames = []
  this.messages = []

  this.populateFromJson = function(json){
    if (json != undefined){
      var jsonChat = JSON.parse(json)
      this.users = jsonChat.users
      this.usernames = jsonChat.userNames
      this.messages = jsonChat.messages
    }
  }

  this.cleanUsers = function(sockets){
    // sockets is the list of connected sockets (auth or not)
    // we remove all disconnected sockets from this.users
    var connectedUserNames = []
    for (let [key, value] of Object.entries(sockets)) {
      connectedUserNames.push(value.handshake.session.userName)
    }
    this.userNames = this.userNames.filter(u => u in connectedUserNames)
  }

  this.newMessage = function(messageText, sessionId){
    var user = this.getUserById(sessionId)
    if (user == undefined){
      return false
    }
    var message = {'text': messageText, 'userName':user.name, date: Date.now()}
    this.messages.push(message)
    // keep only last 200 messages
    this.messages = this.messages.slice(-200)
    return message
  }

  this.createUser = function(session){
    var userName = session.userName
    console.log(userName)
    console.log(session)
    var guestName = userName
    // test if session already have a username
    if (userName != undefined){
      // if we already have a user with same name we add a number at the end
      n = 0
      while (guestName in this.userNames){
        n += 1
        guestName = session.userName + n
      }

      this.userNames.push(guestName)
      session.userName = guestName
      user = new User(guestName, session.id)
      this.users.push(user)
      return guestName
    }
    // guest names are darts champions from https://en.wikipedia.org/wiki/PDC_World_Darts_Championship
    var guestNames = ['P. Taylor', 'P. Wright', 'M. van Gerwen', 'R. Cross', 'G. Durrant', 'A. Lewis',
    'M. smith', 'G. Andersen', 'D. Priestley', 'R. Harrington', 'P. Manley', 'K. Shepherd']
    guestNames = guestNames.filter(name => !(this.userNames.includes(name)))
    // if all guestnames are taken we use guest-n
    if (guestNames.length == 0){
      var guestName = 'guest-' + userNames.length
    } else {
      var guestName = guestNames[Math.floor(Math.random() * guestNames.length)]
    }
    this.userNames.push(guestName)
    user = new User(guestName, session.id)
    this.users.push(user)
    session.userName = guestName
    return guestName
  }

  this.removeUser = function(sessionId){
    this.users = this.users.filter(user => user.id != sessionId)
  }

  this.changeName = function(newName, session){
    console.log(session.userName)
    index = this.userNames.findIndex(name => name == session.userName)
    console.log(index)
    if (index  == -1){
      return false
    }
    this.userNames[index] = newName
    console.log(this.userNames)
    return true
  }

  this.getUserById = function(sessionId){
    return this.users.find(u => u.id == sessionId)
  }
}

function User(userName, sessionId){
  this.name = userName
  this.id = sessionId
}

module.exports = Chat;
