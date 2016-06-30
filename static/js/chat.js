var socket = io();
var o = $('#chat-area');
var user = o.attr('data-user');
var key = o.attr('data-key');
var sentOrRcv = 'received';
var double_user = '';
var double_msg = '';


// Chat Logic
function scrollChat() {
    // a jQuery result is a list, get the first element
    var chat = $('#messages')[0];
    // figure out the height the *top* of window should scroll to
    var pos = chat.scrollHeight - chat.clientHeight;
    chat.scrollTop = pos;
}

$('#new-game-button').on('click', function(event) {
    event.preventDefault();
    if (user) {
        console.log('joining room %s as %s', key, user);
        socket.emit('join', {
            key: key,
            name: user
        });
        console.log('tried to join')
    }
});

socket.on('joined', function(event) {
    var user = event.name;
    console.log('joined %s as %s', key, user);
});

$('#chat').on('submit', function(event) {
    event.preventDefault();
    var msg = $('#m').val();

    if (!msg) return;
    console.log('submitting message');
    socket.emit('chat', {
        name: user,
        message: msg,
        key: key
    });
    $('#m').val('');
    scrollChat();
});

socket.on('new-msg', function(event) {
    if (user === event.sender) {
        sentOrRcv = 'sent';
    }
    else {
        sentOrRcv = 'received';
    }

    if (double_user === event.sender && double_msg === event.message) {
        console.log('double SPAM message ignored');
    }
    else {
        double_user = event.sender;
        double_msg = event.message;
        $('#messages').append($('<li>').addClass('message ' + sentOrRcv).append($('<span>').addClass('user')
        .text(event.sender)).append(': ').append($('<span>').addClass('text').text(event.message)));
    }
});

socket.on('user-joined', function(event) {
    if (double_user === event.name) {
        console.log('double SPAM message ignored');
    }
    else {
        double_user = event.sender;
        $('<li>').addClass('joined').append($('<span>').addClass('user').text(event.name)).append(' has joined the chat').appendTo($('#messages'));
    }
});