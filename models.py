import hashlib
from init import app, db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    login = db.Column(db.String(20))
    email = db.Column(db.String(100), unique=True)
    pw_hash = db.Column(db.String(64))

    @property
    def grav_hash(self):
        hash = hashlib.md5()
        hash.update(self.email.strip().lower().encode('utf8'))
        return hash.hexdigest()

    @property
    def jsonable(self):
        return {
            'id': self.id,
            'grav_hash': self.grav_hash,
            'name': self.name
        }


db.create_all(app=app)
