import flask
import base64
import os
import models
from init import app
import engine


@app.before_request
def setup_csrf():
    if 'csrf_token' not in flask.session:
        flask.session['csrf_token'] = base64.b64encode(os.urandom(32)).decode('ascii')


def check_csrf():
    token = flask.session['csrf_token']
    passed = flask.request.form['_csrf_token']
    if token != passed:
        flask.abort(400)


@app.before_request
def setup_user():
    if 'auth_user' in flask.session:
        user = models.User.query.get(flask.session['auth_user'])
        if user is None:
            del flask.session['auth_user']
        flask.g.user = user


@app.route('/')
def index():
    return flask.render_template('index.html', csrf_token=flask.session['csrf_token'])


@app.route('/home/<int:uid>')
def user_home(uid):
    user = models.User.query.get_or_404(uid)
    return flask.render_template('home.html', user=user)


@app.route('/game/<string:room>')
def game(room):
    existing_game = engine.games.get(room)
    return flask.render_template('game.html', game=existing_game)


@app.route('/logout')
def logout():
    del flask.session['auth_user']
    return flask.redirect(flask.url_for('login'))


@app.route('/request-game/<int:uid>')
def request_game(uid):
    #check_csrf()
    user = models.User.query.get(uid)
    player = engine.Player(user.login, uid, flask.session['csrf_token'])
    if engine.waiting is None:
        new_game = engine.create_game(player)
        engine.waiting = new_game
        engine.games[new_game.key] = new_game
    else:
        new_game = engine.waiting
        new_game.add_player(player)
        engine.waiting = None

    return flask.redirect(flask.url_for('game', room=new_game.key, game=game, uid=uid), code=303)


@app.errorhandler(404)
def not_found(err):
    return flask.render_template('404.html', path=flask.request.path), 404
