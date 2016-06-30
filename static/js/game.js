var socket = io();
var word_str = $('#waiting_room').attr('game_word');

var word = word_str.replace(/\n+/g, ''); //replace with word from bank
console.log(word);

// Letter bank
var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
               'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var word_guess = [];
var blank = '___ ';

// Make letter buttons
for (var i = 0; i < letters.length; i++) {
  if(i == letters.length/2)
    // Even # of letters per row
    $('#letter-container').append($('<br>'));
  $('#letter-container').append($('<button>').addClass('unused pure-button').text(letters[i]));
}

// Build the blanks
for (var l = 0; l < word.length; l++) {
  word_guess[l] = blank;
}
for (var l = 0; l < word.length; l++) {
  $('#word-container').append(word_guess[l]);
}
var num_blanks = word.length; // track # of blanks to determine win
var max_guesses = 8;
var wrong_guesses = 0;

// Hide used letters when clicked
$('button.unused').click(function () {
  // Hide the letter guessed and grab it
  $(this).hide();
  var guess = $(this).text();

  // Reset blanks and wrong flag on each click
  $('#word-container').html("");
  var wrong_flag = true;

  // If out of guesses show hangman
  if (wrong_guesses === max_guesses) {

    $('#word-container').prepend('<img class="hangman" src="http://gdurl.com/W6xY">');
    $('#play-area').append($('<button>').addClass('pure-button replay').text('Try Again'));
    $('#letter-container').html("");
  } else {
    // Keep playing
    for (var alpha = 0; alpha < word.length; alpha++) {
      if (word[alpha].indexOf(guess) > -1) {
        // replace blank with letter
        word_guess[alpha] = guess + " ";
        num_blanks--;
        wrong_flag = false;
      }
      // Print the current guesses
      $('#word-container').append(word_guess[alpha]);

      // Print win and provide new game option
      if (num_blanks === 0 && alpha === word.length-1) {
        $('#letter-container').html("");
        $('#word-container').prepend($('<p>').text('You win!'));
        $('#play-area').append($('<br>'));
        $('#play-area').append($('<button>').addClass('pure-button replay').text('Rematch!'));
      }
    }
    if (wrong_flag)
      wrong_guesses++;
    var guesses_left = max_guesses - wrong_guesses + 1;
    $('#word-container').append($('<p>').text('Guesses remaining: ' + guesses_left));
  }
});


$(window).load(function() {
  socket.emit('ready', {token: csrfToken, game: game});
  $('#waiting_room').hide(); // hide loading icon
});

//var totalPlayers = 2;
//var readyPlayers = 0;
//
//socket.on('connection', function (socket) {
//  socket.on('syncReady', function() {
//    console.log('Client is ready!');
//    readyPlayers++;
//    console.log('Ready Clients: ' + readyPlayers + '/' + totalPlayers);
//    if (readyPlayers == totalPlayers) {
//      console.log('Room is synced! Sending start event...');
//      socket.emit('play');
//    } else {
//      console.log('Room is not synced yet! Waiting...');
//    }
//  });
//});

// Refresh to play again with same player in same room
$('#play-area').on('click', '.replay', function () {
  console.log(uid);
  $.ajax ({
    url: '/request-game/' + uid ,
    data: uid,
    type: 'GET',
    success: function(response) {
      location.reload();
    },
    error: function(error) {
      console.log(error);
    }
  });
});
