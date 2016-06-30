import flask
from flask_socketio import join_room, send, emit, leave_room, disconnect, close_room,rooms
import base64
import uuid
from init import app, db, socketio
import engine


@socketio.on('join')
def on_join(data):
    name = data['name']
    join_room(data['key'])
    emit('joined', {'name': name})
    emit('user-joined', {'name': name}, room=data['key'])


@socketio.on('chat')
def send_room_message(data):
    join_room(data['key'])
    emit('new-msg',
         {'sender': data['name'],'message': data['message']}, room=data['key'])


# @socketio.on('win')
# def send_winner(data):
#     player_x = engine.games[data['game']].player_x
#     player_y = engine.games[data['game']].player_y
#     if player_x.id == data['player']:
#         emit('win-msg', {'player': player_x.name}, room=data['game'].key)
#     elif player_y.id == data['player']:
#         emit('win-msg', {'player': player_y.name}, room=data['game'].key)
