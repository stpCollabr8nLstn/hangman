import base64
import os
import uuid
import random
import flask
from flask_socketio import emit, join_room

from init import app, socketio

waiting = None

class Player:
    position = None
    wrong_guesses = 0

    def __init__(self, name, uid, token):
        self.name = name
        self.id = uid
        self.token = token


class Game:
    player_x = None
    player_y = None
    current = None
    finished = False
    winner = None

    def __init__(self, key):
        self.key = key
        self.word = str((random.choice(list(open('wordbank.txt'))))).upper()

    @property
    def ready(self):
        return self.player_x is not None and self.player_y is not None

    def find_player(self, token):
        if self.player_y and self.player_y.token == token:
            return self.player_y
        elif self.player_x and self.player_x.token == token:
            return self.player_x
        else:
            return None

    def add_player(self, player):
        if self.player_x is None:
            self.player_x = player
            player.position = 'X'
            self.current = player
            return 'X'
        elif self.player_y is None:
            self.player_y = player
            player.position = 'Y'
            return 'Y'
        else:
            raise RuntimeError('game full')


def create_game(player: Player) -> Game:
    xy = random.choice(['X', 'Y'])
    player.position = xy
    key = base64.b64encode(os.urandom(12)).decode('ascii').replace('=', '').replace('/', '$')
    game = Game(key)
    if xy == 'X':
        game.player_x = player
        game.current = player
    else:
        game.player_y = player
    return game


games = {}


@socketio.on('create game')
def on_create_game():
    token = base64.urlsafe_b64encode(uuid.uuid4().bytes)[:12].decode('ascii')
    new_game = Game(token)
    games[token] = new_game


# @socketio.on('ready')
# def on_player_ready(evt):
#     tok = evt['token']
#     key = evt['game']
#     game = games[key]
#     player = game.find_player(tok)
#     if player is None:
#         app.logger.warn('player %s is not in game %s', tok, key)
#         return
#
#     join_room(key)