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


    #Check if the user is a seeker or company and return error if none
    success = db_DA.authenticate_seeker(email, password)
    if success:
        session["user_id"] = success.id
        session["user_type"] = "seeker"
        session["membership"] = success.membership
        return jsonify({"message": "Seeker login successful", "type": "seeker"}), 200
    else:
        success = db_DA.authenticate_company(email, password)

    if success:
        session["user_id"] = success.id
        session["user_type"] = "company"
        session["membership"] = success.membership
        return jsonify({"message": "Company login successful", "type": "company"}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401
    
#Logout function
@api.route("/logout", methods=["POST"])
def logout():   
    session.clear()
    return jsonify({"message": "Logout successful"}), 200

#Seeker registration
@api.route("/register/seeker", methods=["POST"])
def register_seeker():

    #user variables
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
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
        seekerId = db_DA.get_seeker_by_identifier(email = email).id
        db_DA.create_resume(seekerId, education, experience, skills, exp_years, work_mode, field_of_study, preferred_city, preferred_state, preferred_country)

        #Create sessdion cookies
        session["user_id"] = seekerId
        session["user_type"] = "seeker"
        session["membership"] = False
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
        company_id = db_DA.get_company_by_identifier(email = email).id
        session["user_id"] = company_id
        session["user_type"] = "company"
        session["membership"] = False

        return jsonify({"result": "Company created successfully"}), 201
    else:
        return jsonify({"error": "Account already exists"}), 400
    

#Return fields of study options
@api.route("/setup", methods=["GET", "OPTIONS"])
def setup():
    return jsonify({"fields_of_study": db_EG.get_fields_of_study(), 
                    "work_modes": db_EG.get_work_modes(),
                    "education_levels": db_EG.get_education_levels()})

#Upgrade membership
@api.route("/membership", methods=["POST"])
def upgrade():
    membership = session.get("membership")
    if membership is None:
        return jsonify({"error": "Cookie error"}), 401
    
    #Upgrade membership funct
    db_DA.update_membership(user_id=session["user_id"], user_type=session["user_type"])

    session["membership"] = True

    return jsonify({"membership": session["membership"]})


#Get resume data for seeker
@api.route("/resume", methods=["POST"])
def get_resume():

    if session.get("user_type") != "seeker":
        data = request.get_json()
        resumes = db_DA.get_all_resumes_by_seeker(seeker_id=data.get("seeker_id"))  
    else:
        resumes = db_DA.get_all_resumes_by_seeker(seeker_id=session["user_id"])

    resumes_json = []
    for resume in resumes:
        resumes_json.append({
            "id": resume.id,
            "seeker_full_name": resume.seeker_full_name,
            "email": resume.seeker_email,
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
    if "user_id" not in session:
        print("No user_id in session")
        return jsonify({"error": "Unauthorized"}), 401
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

#Get company data
@api.route("/getCompany", methods=["POST"])
def get_company():
    if "user_id" not in session:
        print("No user_id in session")
        return jsonify({"error": "Unauthorized"}), 401
    company = db_DA.get_company_by_identifier(company_id=session["user_id"])
    if not company:
        return jsonify({"error": "Company not found"}), 404

    company_json = {
        "id": company.id,
        "name": company.company_name,
        "email": company.email,
        "city": company.city,
        "state": company.state,
        "country": company.country,
        "short_desc": company.short_desc,
        "bio": company.bio,
        "culture": company.culture,
        "membership": company.membership,
        "founded_year": company.founded_year,
        "industry": company.industry
    }

    return jsonify({"company": company_json})


@api.route("/search", methods=["GET"])
def get_jobs():

    #Extract filter variables from query parameters
    query = request.args.get('q') or None
    work_mode = request.args.get('work_mode')
    education = request.args.get('required_education') or None
    field_of_study = request.args.get('field_of_study') or None
    required_skills = request.args.get('required_skills') or None
    experience = request.args.get('exp_years') or None
    city = request.args.get('city') or None
    state = request.args.get('state') or None
    country = request.args.get('country') or None

    #Require work mode in array
    if not isinstance(work_mode, list):
        work_mode = [work_mode] if work_mode else None

    if (session.get("user_type") == "seeker"):
        #Get matching jobs from database
        raw_jobs = db_DA.query_jobposting(
            query_text=query, 
            required_skills=required_skills, 
            required_education=education,
            exp_years=experience, 
            work_mode=work_mode, 
            field_of_study=field_of_study, 
            city=city, 
            state=state, 
            country=country)
        
        jobs = []
        for job in raw_jobs:
            jobs.append({
                "id": job.id,
                "city": job.city,
                "exp_years": job.exp_years,
                "required_skills": job.required_skills,
                "state": job.state,
                "summary": job.summary,
                "title": job.title,
                "work_mode": job.work_mode, 
                "company_name": job.company_name
            })

        return jsonify({"jobs": jobs})
    
    else:
        #Get matching resumes from database
        raw_resumes = db_DA.query_resume(
            query_text=query, 
            skills=required_skills, 
            education=education,
            exp_years=experience, 
            work_mode=work_mode, 
            field_of_study=field_of_study, 
            preferred_city=city, 
            preferred_state=state, 
            preferred_country=country)
        
        candidates = []
        for resume in raw_resumes:
            candidates.append({
                "id": resume.id,
                "seeker_full_name": resume.seeker_full_name, 
                "preferred_state": resume.preferred_state,
                "preferred_city": resume.preferred_city,
                "work_mode": resume.work_mode,
                "exp_years": resume.exp_years,
                "skills": resume.skills,
                "experience": resume.experience
                
            })

        return jsonify({"candidates": candidates})

#Gte filter options for search page
@api.route("/search/filters", methods=["GET"])
def get_filter_options():

    #Cookie existence check
    if "user_type" not in session:
        print("No user_id or user_type in session")
        return jsonify({"error": "No cookie found"}), 403
    
    locations = []
    skills = [] 
    if session.get("user_type") == "seeker":
        locations = db_EG.get_unique_locations("seeker")
        skills = db_EG.get_unique_skills("seeker")
    else:
        locations = db_EG.get_unique_locations("company")
        skills = db_EG.get_unique_skills("company")

    return jsonify({"locations": locations, "skills": skills})


@api.route("/jobposting", methods=["GET"])
def get_jobposting():
    
    #Extract id 
    id = request.args.get("jobId") or None
    if not id:
        return jsonify({"error": "Job ID is required"}), 400


    rawJob = db_DA.get_jobposting_by_id(id)
    if not rawJob:
        return jsonify({"error": "Job not found"}), 404

    #Convert format to JSONifyable
    job = {
        "id": rawJob.id,
        "city": rawJob.city,
        "companyId": rawJob.company_id,
        "country": rawJob.country,
        "exp_years": rawJob.exp_years,
        "field_of_study": rawJob.field_of_study,
        "required_education": rawJob.required_education,
        "required_skills": rawJob.required_skills,
        "responsibilities": rawJob.responsibilities,
        "state": rawJob.state,
        "summary": rawJob.summary,
        "title": rawJob.title,
        "work_mode": rawJob.work_mode, 
        "company_name": rawJob.company_name,
        "company_email": rawJob.company_email
    }  

    return jsonify({"job": job})

@api.route("/recommendations/jobs", methods=["POST"])
def get_job_recommendations():
    
    #Extract page 
    if "page" in request.args:
        try:
            page = int(request.args.get("page"))
        except ValueError:
            return jsonify({"error": "Invalid page number"}), 400
    else:
        page = 1 

    #Extract resume ID and membership from user profile
    userId = session.get("user_id")
    membership = session.get("membership")
    if not userId:
        return jsonify({"error": "Cookie Error"}), 403
    
    resumeId = db_DA.get_all_resumes_by_seeker(userId)[0].id
    if not resumeId:    
        return jsonify({"error": "Resume not found for user"}), 404


    #Get recommendations
    rawJobs = db_DA.rank_jobpostings_by_resume(resumeId, page)
    if not rawJobs:
        return jsonify({"error": "No jobs found for the given page"}), 404
    
    job = []
    #Convert format to JSONifyable
    for rawJob in rawJobs:
        
        job.append({
            "id": rawJob.id,
            "city": rawJob.city,
            "companyId": rawJob.company_id,
            "country": rawJob.country,
            "exp_years": rawJob.exp_years,
            "field_of_study": rawJob.field_of_study,
            "required_education": rawJob.required_education,
            "required_skills": rawJob.required_skills,
            "responsibilities": rawJob.responsibilities,
            "state": rawJob.state,
            "summary": rawJob.summary,
            "title": rawJob.title,
            "work_mode": rawJob.work_mode, 
            "company_name": rawJob.company_name,
            "company_email": rawJob.company_email
        })

    
    #check if there are other pages
    nextJobs = db_DA.rank_jobpostings_by_resume(resumeId, page + 1)
    if nextJobs is []:
        hasNext = False
    else:
        hasNext = True

    return jsonify({"job": job, "hasMore": hasNext, "membership": membership})


#Employer routes

#Get all employer job postings
@api.route("/all_postings", methods=["GET"])
def get_postings():
    
    postings = db_DA.get_all_jobpostings_by_company(session["user_id"])

    #Convert format to JSONifyable
    postings_json = []
    for posting in postings:
        postings_json.append({
            "id": posting.id,
            "city": posting.city,
            "companyId": posting.company_id,
            "country": posting.country,
            "exp_years": posting.exp_years,
            "field_of_study": posting.field_of_study,
            "required_education": posting.required_education,
            "required_skills": posting.required_skills,
            "responsibilities": posting.responsibilities,
            "state": posting.state,
            "summary": posting.summary,
            "title": posting.title,
            "work_mode": posting.work_mode,
            "company_name": posting.company_name,
            "company_email": posting.company_email
        })

    return jsonify({"postings": postings_json})

#Update job posting
@api.route("/updatePosting", methods=["PUT"])
def update_posting():
    
    #Extract id 
    id = request.args.get("jobId") or None
    if not id:
        return jsonify({"error": "Job ID is required"}), 400

    data = request.get_json()
    print(data)
    db_DA.create_jobposting(
        company_id=session["user_id"],
        title=data["title"],
        summary=data["summary"],
        responsibilities=data["responsibilities"],
        required_skills=data["required_skills"],
        required_education=int(list(data["required_education"].keys())[0]),
        exp_years=data["exp_years"],
        work_mode=data["work_mode"],
        field_of_study=data["field_of_study"],
        city=data["city"],
        state=data["state"],
        country=data["country"]
    )

    #Delete old posting
    db_DA.delete_jobposting(id)
    return jsonify({"message": "Job posting updated successfully"}), 200

#Create new job posting
@api.route("/newPosting", methods=["POST"])
def create_posting():
    #cookie check
    if "user_id" not in session:
        return jsonify({"error": "Cookie Error"}), 401
    
    data = request.get_json()
    print (data)
    if( db_DA.create_jobposting(
        company_id=session["user_id"],
        title=data["title"],
        summary=data["summary"],
        responsibilities=data["responsibilities"],
        required_skills=data["required_skills"],
        required_education=data["required_education"],
        exp_years=data["exp_years"],
        work_mode=data["work_mode"],
        field_of_study=data["field_of_study"],
        city=data["city"],
        state=data["state"],
        country=data["country"]
    )
    ):
        return jsonify({"message": "Job posting created successfully"}), 201
    else:
        return jsonify({"error": "Failed to create job posting"}), 500

#Delete job posting
@api.route("/deletePosting", methods=["DELETE"])
def delete_posting():
    #cookie check
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    #Extract id 
    id = request.args.get("jobId") or None
    if not id:
        return jsonify({"error": "Job ID is required"}), 400

    if db_DA.delete_jobposting(id):
        return jsonify({"message": "Job posting deleted successfully"}), 200
    else:
        return jsonify({"error": "Failed to delete job posting"}), 500
    

#Get recommended candidates by jobposting
@api.route("/recommendations/candidates", methods=["POST"])
def get_candidate_recommendations():

    #Extract and validate data
    data = request.get_json()
    page = int(data.get("page")) or 1
    jobId = data.get("jobposting_id")
    membership = session.get("membership")
    if not jobId:
        return jsonify({"error": "Cookie Error"}), 403

    #Get recommendations
    rawCandidates = db_DA.rank_resumes_by_jobposting(jobId, page)
    if not rawCandidates:
        return jsonify({"error": "No recommendations found for the given page"}), 404
    
    candidates = []
    #Convert format to JSONifyable
    for rawCandidate in rawCandidates:
        
        candidates.append({
            "id": rawCandidate.id,
            "seeker_full_name": rawCandidate.seeker_full_name, 
            "preferred_state": rawCandidate.preferred_state,
            "preferred_city": rawCandidate.preferred_city,        
            "work_mode": rawCandidate.work_mode,
            "exp_years": rawCandidate.exp_years,
            "skills": rawCandidate.skills,
            "experience": rawCandidate.experience
        })

    
    #check if there are other pages
    nextCandidates = db_DA.rank_resumes_by_jobposting(jobId, page + 1)
    if nextCandidates is []:
        hasNext = False
    else:
        hasNext = True

    return jsonify({"candidates": candidates, "hasMore": hasNext, "membership": membership})