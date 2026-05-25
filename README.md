# Setup Instructions  
This section provides essential information for the setup of the intelligent job-matching platform for **local hosting**.  

It should be noted that, should the platform be deployed live and be accessible through the public internet, the below only provides a reference as deployment methods on web hosting platforms may vary. Generally, a similar process is expected for non-local deployment.  

## Pre-requisites  
The application requires some dependencies that must first be installed on your local device, specified below:  

1. Ensure the following is installed in the local environment:  
    * Git (Recommended)
    * Docker Desktop
    * Python 3.8+
    * Node.js 18+
    * npm

2. From the command line, navigate to the desired destination directory where the system will be hosted:  
    ```
    cd path/to/directory
    ```

3. Clone the repository by running the following command:  
    ```
    git clone https://github.com/raphdraft1/314-Seekers.git
    ``` 

4. All system files and directories should now be cloned to your local device. Please follow the environment configurations and build process in the next segment.  


## Environment Configuration  
Prior to building and executing the system, it is necessary to first configure environment variables, ensuring they are set properly to be accessed by the system.  

1. From the system directory `path/to/directory/314-Seekers`, navigate to `frontend` and create an environment file named `.env`. Paste the following contents into the file and save it:  
    ```
    VITE_API_BASE_URL="http://localhost:5000/api"
    ```

2. Then, navigate to the `backend` directory and create an environment file named `.env`. Paste the following contents into the file and save it:  
    ```
    TYPESENSE_API_KEY="anysecretkeyofchoice"
    AUTH_KEY="anyauthkeyofchoice"
    ```

## Build Process
The below step-by-step instructions demonstrate the build process and execution of the system.  

### <u>Typesense Setup</u>  
1. Ensure you are in the system directory, and its subdirectories (frontend, backend, seed-data) are immediately accessible. If not, run:  
    ```
    cd path/to/directory/314-Seekers
    ```

2. In the directory, create a docker compose configuration file named `docker-compose.yml`. Paste the following contents into the file and save it:
    ```
    services:
      typesense:
        image: typesense/typesense:30.1
        restart: on-failure
        ports:
          - "8108:8108"
        volumes:
          - ./typesense-data:/data
        command: '--data-dir /data --api-key=anysecretkeyofchoice --enable-cors'
    ```
    Ensure that the value of `--api-key` matches the value of `TYPESENSE_API_KEY` defined previously in **Environment Configuration**.

3. Open Docker Desktop and ensure it is fully running in the background. Then, from the command line, run the following:
    ```
    docker compose up
    ```
    The installation of Typesense should then begin. When it finishes, a new subdirectory **typesense-data** will be created in the system directory, and the active Typesense instance should be visible in Docker Desktop under **Containers > 314-seekers**. It can then be enabled or disabled from there at any point in the future.

4. On initial startup, the Typesense instance will be empty. The database must first be seeded with data, in this case sample data. This will be done later in **Backend Setup** when the Python environment is set up.

5. Ensure that you start Typesense first before the backend and frontend when you run the application. Keep the Typesense instance active as long as the web application is active.

Typesense will be available at **http://localhost:8108**.  


### <u>Backend Setup</u>  
1. From the system directory, navigate to the backend directory:  
    ```
    cd backend
    ```

2. Create a Python virtual environment:  
    ```
    python -m venv venv
    ```
    Then, activate the virtual environment. For Unix-based systems:  
    ```
    source venv/bin/activate
    ```
    For Windows, if you're using command prompt:
    ```
    "venv/Scripts/activate"
    ```
    or if you're using Powershell:
    ```
    (Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned) ; (& "venv\Scripts\activate")
    ```

4. Ensure the virtual environment is running and you are inside it. Install all backend dependencies:  
    ```
    pip install -r requirements.txt
    ```

5. After all necessary packages are installed, seed the database first by running the seeding script. **It is only necessary to do this once** on initial setup, as data will persist in future sessions:  
    ```
    python ../seed-data/create-and-seed.py
    ```

6. Run the Flask server:  
    ```
    python run.py
    ```

The backend API should then be available at **http://localhost:5000**.


### <u>Frontend Setup</u>  
1. From the system directory, navigate to the frontend directory:  
    ```
    cd frontend
    ```

2. Install frontend dependencies:  
    ```
    npm install
    ```

3. Start the production server:  
    ```
    npm run build
    ```
    Or alternatively, start the development server (for contributors):  
    ```
    npm run dev
    ```

The frontend will be available at **http://localhost:5173**.
