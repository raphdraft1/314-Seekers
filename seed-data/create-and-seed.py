import os
import json
import typesense as ts
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

os.chdir(os.path.dirname(os.path.abspath(__file__)))
load_dotenv("../backend/app/.env")
TYPESENSE_API_KEY = os.environ.get("TYPESENSE_API_KEY")
model = SentenceTransformer("all-MiniLM-L6-v2")

def create_seekers():
    # Create Seeker collection
    client.collections.create({
        "name": "seekers",
        "fields": [
            {"name": "full_name", "type": "string"},
            {"name": "email", "type": "string"},
            {"name": "age", "type": "int32"},
            {"name": "city", "type": "string", "facet": True},
            {"name": "state", "type": "string", "facet": True},
            {"name": "country", "type": "string", "facet": True},
            {"name": "short_desc", "type": "string"},
            {"name": "bio", "type": "string"},
            {"name": "membership", "type": "bool"},
            {"name": "password", "type": "string"}
        ]
    })

def create_companies():
    # Create Company collection
    client.collections.create({
        "name": "companies",
        "fields": [
            {"name": "company_name", "type": "string"},
            {"name": "email", "type": "string"},
            {"name": "short_desc", "type": "string"},
            {"name": "bio", "type": "string"},
            {"name": "city", "type": "string", "facet": True},
            {"name": "state", "type": "string", "facet": True},
            {"name": "country", "type": "string", "facet": True},
            {"name": "founded_year", "type": "int32"},
            {"name": "industry", "type": "string"},
            {"name": "culture", "type": "string"},
            {"name": "membership", "type": "bool"},
            {"name": "password", "type": "string"}
        ]
    })

def create_resumes():
    # Create Resume collection
    client.collections.create({
        "name": "resumes",
        "fields": [
            {"name": "seeker_id", "type": "string", "reference": "seekers.id"},
            {"name": "education", "type": "int32"},
            {"name": "experience", "type": "string"},
            {"name": "skills", "type": "string[]", "facet": True},
            {"name": "exp_years", "type": "int32"},
            {"name": "work_mode", "type": "string[]", "facet": True},
            {"name": "field_of_study", "type": "string[]", "facet": True},
            {"name": "preferred_city", "type": "string", "facet": True},
            {"name": "preferred_state", "type": "string", "facet": True},
            {"name": "preferred_country", "type": "string", "facet": True},
            {"name": "resume_embedding", "type": "float[]", "num_dim": 384}
        ]
    })

def create_jobpostings():
    # Create JobPosting collection
    client.collections.create({
        "name": "jobpostings",
        "fields": [
            {"name": "company_id", "type": "string", "reference": "companies.id"},
            {"name": "title", "type": "string"},
            {"name": "summary", "type": "string"},
            {"name": "responsibilities", "type": "string"},
            {"name": "required_education", "type": "int32"},
            {"name": "required_skills", "type": "string[]", "facet": True},
            {"name": "exp_years", "type": "int32"},
            {"name": "work_mode", "type": "string[]", "facet": True},
            {"name": "field_of_study", "type": "string[]", "facet": True},
            {"name": "city", "type": "string", "facet": True},
            {"name": "state", "type": "string", "facet": True},
            {"name": "country", "type": "string", "facet": True},
            {"name": "jobposting_embedding", "type": "float[]", "num_dim": 384}
        ]
    })

def create_collection(create_func):
    try:
        create_func()
    except ts.exceptions.ObjectAlreadyExists as e:
        print(f"{e} Skipping...")

if __name__ == "__main__":
    client = ts.Client({
        "nodes": [{"host": "localhost", "port": "8108", "protocol": "http"}],
        "api_key": TYPESENSE_API_KEY,
        "connection_timeout_seconds": 300
    })
    
    collections_to_create = [create_seekers, create_companies, create_resumes, create_jobpostings]
    for col in collections_to_create:
        create_collection(col) 

    print("All collections created, importing data...")

    for filename in ["seekers.json", "companies.json"]:
        with open(filename, "r", encoding="utf-8") as file:
            documents = json.load(file, strict=False)
            for doc in documents:
                doc["password"] = generate_password_hash("apples") # Sample password in dev, for all sample users
            jsonl_payload = "\n".join(json.dumps(doc) for doc in documents)
            response = client.collections[filename.split('.')[0]].documents.import_(jsonl_payload.encode("utf-8"), {"action": "upsert"})

    with open("resumes.json", "r", encoding="utf-8") as file:
        documents = json.load(file, strict=False)
        for doc in documents:
            doc["resume_embedding"] = model.encode(doc["experience"]).tolist()
        jsonl_payload = "\n".join(json.dumps(doc) for doc in documents)
        response = client.collections["resumes"].documents.import_(jsonl_payload.encode("utf-8"), {"action": "upsert"})

    with open("jobpostings.json", "r", encoding="utf-8") as file:
        documents = json.load(file, strict=False)
        for doc in documents:
            doc["jobposting_embedding"] = model.encode(doc["summary"] + "\n" + doc["responsibilities"]).tolist()
        jsonl_payload = "\n".join(json.dumps(doc) for doc in documents)
        response = client.collections["jobpostings"].documents.import_(jsonl_payload.encode("utf-8"), {"action": "upsert"})

    print("Import complete.")
    # print(client.collections['seekers'].documents['1'].retrieve()['bio'])