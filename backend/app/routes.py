import os
from app import db_DA, db_EG
from dotenv import load_dotenv
from flask import Blueprint, jsonify, request, session


load_dotenv()

api = Blueprint("api", __name__)

#Connection test
@api.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running"})

#Login logic
@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    success = ""
    print(email)


    #Check if the user is a seeker or company and return error if none
    success = db_DA.authenticate_seeker(email, password)
    if success:
        session["user_id"] = success.id
        session["user_type"] = "seeker"
        return jsonify({"message": "Seeker login successful"}), 200
    else:
        success = db_DA.authenticate_company(email, password)

    if success:
        session["user_id"] = success.id
        session["user_type"] = "company"
        return jsonify({"message": "Company login successful"}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

#Seeker registration
@api.route("/register/seeker", methods=["POST"])
def register_seeker():

    #user variables
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("full_name")
    age = data.get("age")
    city = data.get("city")
    state = data.get("state")
    country = data.get("country")
    short_desc = data.get("short_desc")
    bio = data.get("bio")

    #resume variables
    education = data.get("education")
    experience = data.get("experience")
    skills = data.get("skills")
    exp_years = data.get("exp_years")
    work_mode = data.get("work_mode")
    field_of_study = data.get("field_of_study")
    preferred_city = data.get("preferred_city")
    preferred_state = data.get("preferred_state")
    preferred_country = data.get("preferred_country")

    #Create both seeker and resume if seeker is new
    if db_DA.create_seeker(name, email, age, city, state, country, short_desc, bio, password):
        seekerId = db_DA.get_seeker_by_identifier(email = email) 
        db_DA.create_resume(seekerId, education, experience, skills, exp_years, work_mode, field_of_study, preferred_city, preferred_state, preferred_country)

        #Create sessdion cookies
        session["user_id"] = seekerId
        session["user_type"] = "seeker"

        return jsonify({"result": "Seeker and resume created successfully"}), 201
    else:
        return jsonify({"error": "Account already exists"}), 400
    
#Company registration
@api.route("/register/company", methods=["POST"])
def register_company():
    #Company Var
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    city = data.get("city")
    state = data.get("state")
    country = data.get("country")
    short_desc = data.get("short_desc")
    bio = data.get("bio")
    fYear = data.get("fYear")
    industry = data.get("industry")
    culture = data.get("culture")

    #Create company if company is new
    if db_DA.create_company(name, email, city, state, country, short_desc, bio, fYear, industry, culture, password):
        company_id = db_DA.get_company_by_identifier(email = email)
        session["user_id"] = company_id
        session["user_type"] = "company"

        return jsonify({"result": "Company created successfully"}), 201
    else:
        return jsonify({"error": "Account already exists"}), 400
    

#Return fields of study options
@api.route("/setup", methods=["GET", "OPTIONS"])
def setup():
    return jsonify({"fields_of_study": db_EG.get_fields_of_study(), 
                    "work_modes": db_EG.get_work_modes(),
                    "education_levels": db_EG.get_education_levels()})


#Get resume data for seeker
@api.route("/resume", methods=["GET"])
def get_resume():
    resumes = db_DA.get_all_resumes_by_seeker(seeker_id=session["user_id"])

    resumes_json = []
    for resume in resumes:
        resumes_json.append({
            "id": resume.id,
            "seeker_id": resume.seeker_id,
            "education": resume.education,
            "experience": resume.experience,
            "skills": resume.skills,
            "exp_years": resume.exp_years,
            "work_mode": resume.work_mode,
            "field_of_study": resume.field_of_study,
            "preferred_city": resume.preferred_city,
            "preferred_state": resume.preferred_state,
            "preferred_country": resume.preferred_country
        })

    return jsonify({"resumes": resumes_json})

#Get seeker data
@api.route("/getSeeker", methods=["POST"])
def get_seeker():
    seeker = db_DA.get_seeker_by_identifier(seeker_id=session["user_id"])
    if not seeker:
        return jsonify({"error": "Seeker not found"}), 404

    seeker_json = {
        "id": seeker.id,
        "full_name": seeker.full_name,
        "email": seeker.email,
        "age": seeker.age,
        "city": seeker.city,
        "state": seeker.state,
        "country": seeker.country,
        "short_desc": seeker.short_desc,
        "bio": seeker.bio,
        "membership": seeker.membership
    }

    return jsonify({"seeker": seeker_json})