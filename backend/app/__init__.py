from multiprocessing.dummy.connection import Connection
import os
from app.dataaccess import Connection, DataAccess
from flask import Flask
from flask_cors import CORS


#DB connect
db_conn = Connection()
db = DataAccess(db_conn)

def create_app():

    #Create flask instance
    app = Flask(__name__)

    #Allow all origins
    CORS(app)


    # Register blueprints
    from app.routes import api

    app.register_blueprint(api, url_prefix="/api")

    return app