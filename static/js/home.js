var switchTabs = function(tabName){
    $('#roomTab a[href="#'+ tabName + '"]').tab('show')
}

$(function () {
  var updateRooms = function(rooms){
    var template = templates.cardRoom
    var html = ejs.render(template, { rooms: rooms });
    $('#rooms').html(html)
  };

  var joinRoom = function(roomId){
    io.emit('joinRoom',roomId)
  }
  $('#jitsi-connect-button').click(function(){
    $('#jitsi-connect-button').addClass('d-none');
    var jitsiContainer = document.getElementById("jitsi-container");
    jitsiConnect(jitsiContainer, 'onlinedarts', '');
  })
  var socket = io();

  socket.emit('join-home')

  $('#create-room').submit(function(e){
    e.preventDefault(); // prevents page reloading
    var roomName = $('#new-room-name').val();
    var password = $('#new-room-password').val();
    $('#new-room-name').val('')
    $('#new-room-password').val('')
    switchTabs('roomTab')
    socket.emit('create-room', {roomName: roomName, password:password});
    return false;
  });

  socket.on('update-rooms', function(rooms){
    updateRooms(rooms);
  });
});
