import os
from dotenv import load_dotenv
from flask import Blueprint, jsonify, request

load_dotenv()

api = Blueprint("api", __name__)

#Connection test
@api.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running"})