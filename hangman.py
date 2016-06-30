from init import app, db, socketio

import views, views_auth, api, engine

if __name__ == '__main__':
    app.run(debug=True)
