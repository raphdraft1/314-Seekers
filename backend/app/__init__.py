from multiprocessing.dummy.connection import Connection
import os
from app.dataaccess import Connection, DataAccess, EnumGetter
from flask import Flask
from flask_cors import CORS


#DB connect
db_conn = Connection()
db_DA = DataAccess(db_conn)
db_EG = EnumGetter(db_conn)

def create_app():

    #Create flask instance
    app = Flask(__name__)
    app.secret_key = os.getenv("AUTH_KEY")

    #Allow all origins
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

    #Cookie settings
    app.config["SESSION_COOKIE_SAMESITE"] = "lax"
    app.config["SESSION_COOKIE_SECURE"] = False


    # Register blueprints
    from app.routes import api

    app.register_blueprint(api, url_prefix="/api")

    return app