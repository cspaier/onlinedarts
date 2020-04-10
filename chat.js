function Chat(){
  this.users = []
  this.messages = []

  this.newMessage = function(messageText, socketId){
    var user = this.getUserById(socketId)
    if (user == undefined){
      return false
    }
    var message = {'text': messageText, 'userName':user.name}
    this.messages.push(message)
    // keep only last 200 messages
    this.messages = this.messages.slice(-200)
    return message
  }

  this.createUser = function(socketId){
    var userNames = this.users.map(u => u.name)
    var guestNames = ['P. Taylor', 'P. Wright', 'M. van Gerwen', 'R. Cross', 'G. Durrant', 'A. Lewis' ]
    guestNames = guestNames.filter(name => !(userNames.includes(name)))
    var guestName = guestNames[Math.floor(Math.random() * guestNames.length)]
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
