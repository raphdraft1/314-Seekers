import os
import json
import time
import typesense as ts
from sentence_transformers import SentenceTransformer
from models import Seeker, Company, Resume, JobPosting
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

class Connection:
    def __init__(self):
        self.TYPESENSE_API_KEY = os.environ.get("TYPESENSE_API_KEY")
        self.client = ts.Client({
            "nodes": [{"host": "localhost", "port": "8108", "protocol": "http"}],
            "api_key": self.TYPESENSE_API_KEY,
            "connection_timeout_seconds": 300
        })

class DataAccess:
    def __init__(self, connection: Connection):
        self.client = connection.client
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

    def create_seeker(self, full_name: str, email: str, age: int, city: str, state: str, country: str, 
                     short_desc: str, bio: str, password: str):
        # Check if email already exists
        if self.getSeekerById(email=email):
            print("Email is already in use.")
            return False

        self.client.collections["seekers"].documents.create({
            "full_name": full_name,
            "email": email,
            "age": age,
            "city": city,
            "state": state,
            "country": country,
            "short_desc": short_desc,
            "bio": bio,
            "membership": False,
            "password": generate_password_hash(password)
        })
        return True

    def create_company(self, company_name: str, email: str, city: str, state: str, country: str, 
                      short_desc: str, bio: str, founded_year: int, industry: str, culture: str, password: str):
        # Check if email already exists
        if self.getCompanyById(email=email):
            print("Email is already in use.")
            return False

        self.client.collections["seekers"].documents.create({
            "company_name": company_name,
            "email": email,
            "city": city,
            "state": state,
            "country": country,
            "short_desc": short_desc,
            "bio": bio,
            "founded_year": founded_year,
            "industry": industry,
            "culture": culture,
            "membership": False,
            "password": generate_password_hash(password)
        })
        return True 

    def authenticate_seeker(self, email: str, password: str):
        """
        Authenticates a Seeker according to provided email and password.
        Returns a Seeker object or None depending on authentication result.
        """
        # Check if user exists
        seeker = self.getSeekerById(email=email)

        if not seeker:
            return None
        
        # Get Seeker object
        if check_password_hash(seeker.password, password):
            return seeker
        
        print(f"Authentication for {email} failed.")
        return None

    def authenticate_company(self, email: str, password: str):
        """
        Authenticates a Company according to provided email and password.
        Returns a Company object or None depending on authentication result.
        """
        # Check if user exists
        company = self.getCompanyById(email=email)

        if not company:
            return None
        
        # Get Companu object
        if check_password_hash(company.password, password):
            return company

        print(f"Authentication for {email} failed.")
        return None


    def get_seeker_by_identifier(self, seeker_id: str = None, email: str = None):
        # seeker_id and email are not provided
        if bool(seeker_id) and bool(email):
            raise TypeError("Either Seeker ID or email must be provided.")

        if seeker_id:
            try:
                result = self.client.collections["seekers"].documents[f"{seeker_id}"].retrieve()
                seeker = Seeker(id=result["id"], full_name=result["full_name"], email=result["email"],
                              age=result["age"], city=result["city"], state=result["state"], country=result["country"],
                              short_desc=result["short_desc"], bio=result["bio"], membership=result["membership"])
                seeker.password = result["password"]
                return seeker
            
            except ts.exceptions.ObjectNotFound as e:
                print(f"Seeker collection: {e}")
                return None
        
        if email:
            result = self.client.collections["seekers"].documents.search({
                "q": "*",
                "filter_by": f"email:={email}"
            })

            # No seeker found
            if len(result["hits"]) == 0:
                print("Seeker not found.")
                return None
            
            result = result["hits"][0]["document"]
            seeker = Seeker(id=result["id"], full_name=result["full_name"], email=result["email"],
                              age=result["age"], city=result["city"], state=result["state"], country=result["country"],
                              short_desc=result["short_desc"], bio=result["bio"], membership=result["membership"])
            seeker.password = result["password"]
            return seeker
        
    
    def get_company_by_identifier(self, company_id: str = None, email: str = None):
        # company_id and email are not provided
        if not company_id and not email:
            raise TypeError("Either Company ID or email must be provided.")

        if company_id:
            try:
                result = self.client.collections["companies"].documents[f"{company_id}"].retrieve()
                company = Company(id=result["id"], company_name=result["company_name"], email=result["email"], 
                                 city=result["city"], state=result["state"], country=result["country"],
                                 short_desc=result["short_desc"], bio=result["bio"], founded_year=result["founded_year"],
                                 industry=result["industry"], culture=result["culture"], membership=result["membership"])
                company.password = result["password"]
                return company
            
            except ts.exceptions.ObjectNotFound as e:
                print(f"Company collection: {e}")
                return None
        
        if email:
            result = self.client.collections["companies"].documents.search({
                "q": "*",
                "filter_by": f"email:={email}"
            })

            # No seeker found
            if len(result["hits"]) == 0:
                print("Company not found.")
                return None
            
            result = result["hits"][0]["document"]
            company = Company(id=result["id"], company_name=result["company_name"], email=result["email"], 
                            city=result["city"], state=result["state"], country=result["country"],
                            short_desc=result["short_desc"], bio=result["bio"], founded_year=result["founded_year"],
                            industry=result["industry"], culture=result["culture"], membership=result["membership"])
            company.password = result["password"]
            return company

    def create_resume(self, seeker_id: str, education: int, experience: str, skills: list[str], exp_years: int, 
                     work_mode: list[str], field_of_study: list[str], preferred_city: str, 
                     preferred_state: str, preferred_country: str):
        
        self.client.collections["resumes"].documents.create({
            "seeker_id": seeker_id,
            "education": education,
            "experience": experience,
            "skills": skills,
            "exp_years": exp_years,
            "work_mode": work_mode,
            "field_of_study": field_of_study,
            "preferred_city": preferred_city,
            "preferred_state": preferred_state,
            "preferred_country": preferred_country,
            "resume_embedding": self.model.encode(experience).tolist()
        })
    
    def create_jobposting(self, company_id: str, title: str, summary: str, responsibilities: str, 
                         required_education: int, required_skills: list[str], exp_years: int, 
                         work_mode: list[str], field_of_study: list[str], city: str, 
                         state: str, country: str):
        
        self.client.collections["jobpostings"].documents.create({
            "company_id": company_id,
            "title": title,
            "summary": summary,
            "responsibilities": responsibilities,
            "required_education": required_education,
            "required_skills": required_skills,
            "exp_years": exp_years,
            "work_mode": work_mode,
            "field_of_study": field_of_study,
            "city": city,
            "state": state,
            "country": country,
            "jobposting_embedding": self.model.encode(summary + "\n" + responsibilities).tolist()
        })

    def get_resume_by_id(self, resume_id: str):
        try:
            result = self.client.collections["resumes"].documents[f"{resume_id}"].retrieve({"include_fields": "$seekers(full_name, email)"})
            resume = Resume(id=result["id"], seeker_id=result["seeker_id"], education=result["education"],
                            experience=result["experience"], skills=result["skills"], exp_years=result["exp_years"],
                            work_mode=result["work_mode"], field_of_study=result["field_of_study"], 
                            preferred_city=result["preferred_city"], preferred_state=result["preferred_state"], 
                            preferred_country=result["preferred_country"], resume_embedding=result["resume_embedding"])
            resume.seeker_full_name = result["seekers"]["full_name"]
            resume.seeker_email = result["seekers"]["email"]
            return resume
    
        except ts.exceptions.ObjectNotFound as e:
            print(f"Resume collection: {e}")
            return None
        
    def get_jobposting_by_id(self, jobposting_id: str):
        try:
            result = self.client.collections["jobpostings"].documents[f"{jobposting_id}"].retrieve({"include_fields": "$companies(company_name, email)"})
            jobposting = JobPosting(id=result["id"], company_id=result["company_id"], title=result["title"],
                                summary=result["summary"], responsibilities=result["responsibilities"],
                                required_education=result["required_education"], required_skills=result["required_skills"], 
                                exp_years=result["exp_years"], work_mode=result["work_mode"], field_of_study=result["field_of_study"], 
                                city=result["city"], state=result["state"], country=result["country"], jobposting_embedding=result["jobposting_embedding"])
            jobposting.company_name = result["companies"]["company_name"]
            jobposting.company_email = result["companies"]["company_name"]
            return jobposting
    
        except ts.exceptions.ObjectNotFound as e:
            print(f"Jobposting collection: {e}")
            return None
    
    def get_all_seeker_resumes(self, seeker_id: str, page_number: int = 1):
        if not seeker_id:
            raise TypeError("Seeker ID must be provided")
        
        result = self.client.collections["resumes"].documents.search({
            "q": "*",
            "filter_by": f"seeker_id:={seeker_id}",
            "page": page_number,
            "per_page": 10,
            "include_fields": "$seekers(full_name, email)"
        })

        resume_list = self.json_to_resume_list(result)
        return resume_list
    
    def get_all_company_jobpostings(self, company_id: str, page_number: int = 1):
        if not company_id:
            raise TypeError("Company ID must be provided")
        
        result = self.client.collections["jobpostings"].documents.search({
            "q": "*",
            "filter_by": f"company_id:={company_id}",
            "page_number": page_number,
            "per_page": 10,
            "include_fields": "$companies(company_name, email)"
        })

        jobposting_list = self.json_to_jobposting_list(result)
        return jobposting_list
    
    def query_resume(self, query_text: str, skills: list[str] = None, education: int = None, 
                     exp_years: int = None, work_mode: list[str] = None, field_of_study: list[str] = None,
                     preferred_city: str = None, preferred_state: str = None, preferred_country: str = None):
        
        field_names = ["skills", "education", "preferred_city", "preferred_state", "preferred_country"]
        result = self.client.collections["resumes"].documents.search({
            "q": f"{query_text if query_text else "*"}",
            "query_by": "experience, skills, field_of_study",
            "filter_by": self.build_filter(field_names, skills, education,
                                           exp_years, work_mode, field_of_study,
                                           preferred_city, preferred_state, preferred_country),
            "per_page": 20,
            "num_typos": 5,
            "include_fields": "$seekers(full_name, email)"
        })

        resume_list = self.json_to_resume_list(result)
        return resume_list
    
    def query_jobposting(self, query_text: str, required_skills: list[str] = None, required_education: int = None, 
                     exp_years: int = None, work_mode: list[str] = None, field_of_study: list[str] = None,
                     city: str = None, state: str = None, country: str = None):
        
        field_names = ["required_skills", "required_education", "city", "state", "country"]
        result = self.client.collections["jobpostings"].documents.search({
            "q": f"{query_text if query_text else "*"}",
            "query_by": "title, summary, responsibilities, required_skills, field_of_study",
            "filter_by": self.build_filter(field_names, required_skills, required_education,
                                           exp_years, work_mode, field_of_study,
                                           city, state, country),
            "per_page": 20,
            "num_typos": 5,
            "include_fields": "$companies(company_name, email)"
        })

        jobposting_list = self.json_to_jobposting_list(result)
        return jobposting_list
    
    def rank_resumes_by_jobposting(self, jobposting_id: str):
        jobposting_to_use = self.get_jobposting_by_id(jobposting_id)
        owned_by_company = self.get_company_by_identifier(jobposting_to_use.company_id)

        # Set an arbitrarily high number like 10000 for "unlimited recommendations" if a member
        # Set k = 10 if not a member
        return_top_k = 10000 if owned_by_company.membership else 10
        
        if jobposting_to_use:
            result = self.client.multi_search.perform({
                "searches": [{
                    "collection": "resumes",
                    "q": f"{" ".join(jobposting_to_use.required_skils)}",
                    "query_by": "skills",
                    "filter_by": f"education:>={jobposting_to_use.required_education} && exp_years:>={jobposting_to_use.exp_years} && \
                    work_mode:=[{", ".join(jobposting_to_use.work_mode)}] && field_of_study:=[{", ".join(jobposting_to_use.field_of_study)}] && \
                    preferred_country:={jobposting_to_use.country}",
                    
                    "vector_query": f"resume_embedding:({jobposting_to_use.jobposting_embedding}, k:{return_top_k})",
                    "per_page": 20,
                    "include_fields": "$seekers(full_name, email)"
            }]})

            resume_list = self.json_to_resume_list(result["results"][0])
            return resume_list
        return []
    
    def rank_jobpostings_by_resume(self, resume_id: str):
        resume_to_use = self.get_resume_by_id(resume_id)
        owned_by_seeker = self.get_seeker_by_identifier(resume_to_use.seeker_id)

        # Set an arbitrarily high number like 10000 for "unlimited recommendations" if a member
        # Set k = 10 if not a member
        return_top_k = 10000 if owned_by_seeker.membership else 10
        
        if resume_to_use:
            result = self.client.multi_search.perform({
                "searches": [{
                    "collection": "jobpostings",
                    "q": f"{" ".join(resume_to_use.skills)}",
                    "query_by": "required_skills",
                    "filter_by": f"required_education:<={resume_to_use.education} && exp_years:<={resume_to_use.exp_years} && \
                    work_mode:=[{", ".join(resume_to_use.work_mode)}] && field_of_study:=[{", ".join(resume_to_use.field_of_study)}] && \
                    country:={resume_to_use.preferred_country}",
                    
                    "vector_query": f"jobposting_embedding:({resume_to_use.resume_embedding}, k:{return_top_k})",
                    "per_page": 20,
                    "include_fields": "$companies(company_name, email)"
            }]})

            jobposting_list = self.json_to_jobposting_list(result["results"][0])
            return jobposting_list
        return []

    def build_filter(self, field_names: list[str], skills: list[str] = None, education: int = None, 
                     exp_years: int = None, work_mode: list[str] = None, field_of_study: list[str] = None,
                     city: str = None, state: str = None, country: str = None):
        filters = []

        if skills:
            skills_list = ", ".join(skills)
            filters.append(f"{field_names[0]}:=[{skills_list}]")
        if education:
            filters.append(f"{field_names[1]}:>={education}")
        if exp_years:
            filters.append(f"exp_years:>={exp_years}")
        if work_mode:
            modes = ", ".join(work_mode)
            filters.append(f"work_mode:=[{modes}]")
        if field_of_study:
            fields = ", ".join(field_of_study)
            filters.append(f"field_of_study:=[{fields}]")
        if city:
            filters.append(f"{field_names[2]}:={city}")
        if state:
            filters.append(f"{field_names[3]}:={state}")
        if country:
            filters.append(f"{field_names[4]}:={country}")

        return " && ".join(filters) if filters else ""
    
    def json_to_resume_list(self, json_response):
        # No resumes found
        if len(json_response["hits"]) == 0:
            print("No resumes found for the given query.")
            return []

        resume_list = []
        for resume_data in json_response["hits"]:
            resume_data = resume_data["document"]
            resume_to_append = Resume(id=resume_data["id"], seeker_id=resume_data["seeker_id"], education=resume_data["education"],
                                        experience=resume_data["experience"], skills=resume_data["skills"], exp_years=resume_data["exp_years"],
                                        work_mode=resume_data["work_mode"], field_of_study=resume_data["field_of_study"], 
                                        preferred_city=resume_data["preferred_city"], preferred_state=resume_data["preferred_state"], 
                                        preferred_country=resume_data["preferred_country"], resume_embedding=resume_data["resume_embedding"])
            resume_to_append.seeker_full_name = resume_data["seekers"]["full_name"]
            resume_to_append.seeker_email = resume_data["seekers"]["email"]
            resume_list.append(resume_to_append)
            
        return resume_list
    
    def json_to_jobposting_list(self, json_response):
        # No job postings found
        if len(json_response["hits"]) == 0:
            print("No job postings found for given Company.")
            return []
        
        jobposting_list = []
        for jobposting_data in json_response["hits"]:
            jobposting_data = jobposting_data["document"]
            jobposting_to_append = JobPosting(id=jobposting_data["id"], company_id=jobposting_data["company_id"], title=jobposting_data["title"],
                                              summary=jobposting_data["summary"], responsibilities=jobposting_data["responsibilities"],
                                              required_education=jobposting_data["required_education"], required_skills=jobposting_data["required_skills"], 
                                              exp_years=jobposting_data["exp_years"], work_mode=jobposting_data["work_mode"], 
                                              field_of_study=jobposting_data["field_of_study"], city=jobposting_data["city"], state=jobposting_data["state"], 
                                              country=jobposting_data["country"], jobposting_embedding=jobposting_data["jobposting_embedding"])
            jobposting_to_append.company_name = jobposting_data["companies"]["company_name"]
            jobposting_to_append.company_email = jobposting_data["companies"]["email"]
            jobposting_list.append(jobposting_to_append)

        return jobposting_list

class EnumGetter:
    def __init__(self, connection: Connection):
        self.client = connection.client
    
    def map_int_to_education(self, education_index):
        education_levels = {
            0: "None", 
            1: "Secondary", 
            2: "Certificate I-II", 
            3: "Certificate III-IV", 
            4: "Diploma", 
            5: "Advanced Diploma / Associate Degree",
            6: "Bachelor", 
            7: "Bachelor Honours / Graduate Certificate / Graduate Diploma", 
            8: "Master", 
            9: "PhD / Doctoral"
        }
        return education_levels[education_index]
    
    def map_education_to_int(self, education_name):
        education_levels = {
            "None": 0, 
            "Secondary": 1, 
            "Certificate I-II": 2, 
            "Certificate III-IV": 3, 
            "Diploma": 4, 
            "Advanced Diploma / Associate Degree": 5,
            "Bachelor": 6, 
            "Bachelor Honours / Graduate Certificate / Graduate Diploma": 7, 
            "Master": 8, 
            "PhD / Doctoral": 9
        }
        return education_levels[education_name]
    
    def get_fields_of_study(self):
        return ["Computer Science", "Artificial Intelligence", "Computer Vision", "Robotics",
                "Software Engineering", "Data Analytics", "Machine Learning", "Deep Learning",
                "Web Development", "Mobile Development", "UI/UX", "Cloud Computing", "Cluster Computing",
                "Database Management", "Computer Networking", "Operating Systems", "Cybersecurity", "Logging and Monitoring"]
    
    def get_unique_skills(self, workflow: str):
        if workflow == "seeker":
            result = self.client.collections["jobpostings"].documents.search({
                "q": "*",
                "query_by": "required_skills",
                "facet_by": "required_skills",
                "max_facet_values": 100
            })
            return [f["value"] for f in result["facet_counts"][0]["counts"]]
        
        if workflow == "company":
            result = self.client.collections["resumes"].documents.search({
                "q": "*",
                "query_by": "skills",
                "facet_by": "skills",
                "max_facet_values": 100
            })
            return [f["value"] for f in result["facet_counts"][0]["counts"]]
        
        print("Invalid workflow name. Please pass either 'seeker' or 'company' for the workflow parameter.")
        return []
    
    def get_unique_locations(self, workflow: str):
        if workflow != "seeker" and workflow != "company":
            print("Invalid workflow name. Please pass either 'seeker' or 'company' for the workflow parameter.")
            return {}

        result = {}
        if workflow == "seeker":
            result = self.client.collections["jobpostings"].documents.search({
                "q": "*",
                "query_by": "city, state, country",
                "facet_by": "city, state, country",
                "max_facet_values": 100
            })

        if workflow == "company":
            result = self.client.collections["resumes"].documents.search({
                "q": "*",
                "query_by": "preferred_city, preferred_state, preferred_country",
                "facet_by": "preferred_city, preferred_state, preferred_country",
                "max_facet_values": 100
            })
        
        return {
            "cities": [f["value"] for f in result["facet_counts"][0]["counts"]],
            "states": [f["value"] for f in result["facet_counts"][1]["counts"]],
            "countries": [f["value"] for f in result["facet_counts"][2]["counts"]]
        }      
    
# Testing

connection = Connection()

db = DataAccess(connection)
eg = EnumGetter(connection)

# print(db.get_seeker_by_identifier("10"))
# print(db.get_seeker_by_identifier("0"))

# print(db.authenticateCompany("recruitment@traxion.com.au", "wrong_pw"))
# print(db.authenticateCompany("noemailbro", "fake_pw"))
# print(db.authenticateCompany("recruitment@traxion.com.au", "apples"))
# print(db.authenticateCompany("careers@ironcladsystems.com.au", "apples"))
# print(db.authenticateCompany("careers@lumenai.io", "apples"))
# print(db.authenticateCompany("talent@veloq.ai", "apples"))
# print(db.getAllSeekerResumes("1"))
# print(db.getAllSeekerResumes("2"))
# print(db.getAllSeekerResumes("3"))
# print(db.getResumeById("1"))

# print(db.get_all_company_jobpostings("0"))
# print(db.get_all_company_jobpostings("1"))
# print(db.get_all_company_jobpostings("2"))
# print(db.get_all_company_jobpostings("3"))
# print(db.get_all_company_jobpostings("4"))
# print(db.rank_resumes_by_jobposting("11"))
# print(db.rank_jobpostings_by_resume("7"))

# print(eg.get_unique_skills("hmm"))
# print(eg.get_unique_skills("company"))
# print(eg.get_unique_skills("seeker"))
# print(eg.get_unique_locations("seeker"))
# print(eg.get_unique_locations("company"))

resume = db.get_resume_by_id("2")
print(resume.seeker_full_name, resume.seeker_email)

jobposting = db.get_jobposting_by_id("6")
print(jobposting.company_name, jobposting.company_email)

jps = db.get_all_company_jobpostings("3")
for jp in jps:
    print(jp.company_name, jp.company_email)

rsms = db.get_all_seeker_resumes("7")
for rsm in rsms:
    print(rsm.seeker_full_name, rsm.seeker_email)

rsm_ranked = db.rank_resumes_by_jobposting("11")
for rsm in rsm_ranked:
    print(rsm.seeker_full_name, rsm.seeker_email)

jp_ranked = db.rank_jobpostings_by_resume("7")
for jp in jp_ranked:
    print(jp.company_name, jp.company_email)