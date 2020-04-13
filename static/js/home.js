var switchTabs = function(tabName){
  $('#roomTab a[href="#'+ tabName + '"]').tab('show')
}

$(function () {
  var newMessages = 0
  var visible = (document.visibilityState == 'visible')
  document.addEventListener("visibilitychange", function() {
    visible = (document.visibilityState == 'visible')
    if (visible){
      newMessages = 0
      updateTitle()
    }
  });

  var updateTitle = function(){
    if (visible){
      document.title = 'Onlinedarts';
    } else {
      document.title = '(' + newMessages + ') Onlinedarts'
    }
  }

  var updateRooms = function(rooms){
    var template = templates.cardRoom
    var html = ejs.render(template, { rooms: rooms });
    $('#rooms').html(html)
  };

  var joinRoom = function(roomId){
    io.emit('joinRoom',roomId)
  }

  var updateNames = function(chat){
    html = ""
    chat.users.forEach((user, i) => {
      html += '<li class="list-group-item">' + user.name + '</li>'
    });
    $('#users').html(html)
  }

  var updateMessages = function(chat){
    if (!visible){
      newMessages += 1
      updateTitle()
    }
    var template = templates.messages
    var html = ejs.render(template, { messages: chat.messages});
    $('#messages').html(html)
    $('#messages').scrollTop($('#messages').prop("scrollHeight"))

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
    switchTabs('roomsTab')
    socket.emit('create-room', {roomName: roomName, password:password});
    return false;
  });

  $('#send-message').submit(function(e){
    e.preventDefault(); // prevents page reloading
    var message = $('#new-message').val();
    if (message.length == 0){
      return false;
    }
    $('#new-message').val('')
    socket.emit('new-message', message);
    return false;
  });

  $('#change-name').submit(function(e){
    e.preventDefault(); // prevents page reloading
    var name = $('#new-name').val()
    $('#new-name').blur()
    socket.emit('change-name', name)
    return false;
  })

  socket.on('update-rooms', function(rooms){
    updateRooms(rooms);
  });

  socket.on('update-names', function(chat){
    updateNames(chat)
  });

  socket.on('new-name', function(name){
    $('#new-name').val('');
    $('#new-name').attr("placeholder", name)
  });

  socket.on('new-message', function(chat){
    updateMessages(chat)
  });

  var splitobj = Split(["#home-col","#col-home-right"], {
    elementStyle: function (dimension, size, gutterSize) {
      $(window).trigger('resize'); // Optional
      return {'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'}
    },
    gutterStyle: function (dimension, gutterSize) { return {'flex-basis':  gutterSize + 'px'} },
    gutter: (index, direction) => {
      const gutter = document.createElement('div')
      gutter.className = `gutter gutter-${direction} d-none d-lg-block h-100`
      return gutter
    },
    sizes: [50,50],
    minSize: 300,
    gutterSize: 10,
    cursor: 'col-resize'
  });
});// $(function ()
