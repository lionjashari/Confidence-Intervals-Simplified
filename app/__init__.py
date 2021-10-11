from flask import Flask


app = Flask(__name__)
app.config["SECRET_KEY"] = b'\x11^\x92\x0e\xe6\xe2s\x19t\x8an\xb2(d\x08j+\x7f\xff\xbf\xeb\x14\xe3\x9c'


from app import routes
