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

    #Allow all origins
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])


    # Register blueprints
    from app.routes import api

    app.register_blueprint(api, url_prefix="/api")

    return app