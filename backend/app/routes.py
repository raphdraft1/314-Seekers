import os
from app import db
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
    success = db.authenticate_seeker(email, password)
    if success:
        session["user_id"] = success.id
        session["user_type"] = "seeker"
        return jsonify({"message": "Seeker login successful"}), 200
    else:
        success = db.authenticate_company(email, password)

    if success:
        session["user_id"] = success.id
        session["user_type"] = "company"
        return jsonify({"message": "Company login successful"}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

#Seeker registration
api.route("/register/seeker", methods=["POST"])
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
    if db.create_seeker(name, email, age, city, state, country, short_desc, bio, password):
        seekerId = db.get_seeker_by_identifier(email = email) 
        db.create_resume(seekerId, education, experience, skills, exp_years, work_mode, field_of_study, preferred_city, preferred_state, preferred_country)

        #Create sessdion cookies
        session["user_id"] = seekerId
        session["user_type"] = "seeker"

        return jsonify({"result": "Seeker and resume created successfully"}), 201
    else:
        return jsonify({"error": "Account already exists"}), 400
    
#Company registration
api.route("/register/company", methods=["POST"])
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
    if db.create_company(name, email, city, state, country, short_desc, bio, fYear, industry, culture, password):
        company_id = db.get_company_by_identifier(email = email)
        session["user_id"] = company_id
        session["user_type"] = "company"

        return jsonify({"result": "Company created successfully"}), 201
    else:
        return jsonify({"error": "Account already exists"}), 400