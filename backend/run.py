import os
from dotenv import load_dotenv
from app import create_app

#Load env files and config
load_dotenv()

app = create_app()

#Start app
if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)
