from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():

    #Create flask instance
    app = Flask(__name__)

    #Allow all origins
    CORS(app)

    # Register blueprints
    from app.routes import api

    app.register_blueprint(api, url_prefix="/api")

    return app