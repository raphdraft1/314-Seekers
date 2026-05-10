import os
import json
import time
import typesense as ts
from sentence_transformers import SentenceTransformer
from app.models import Seeker, Company, Resume, JobPosting
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

class Connection:
    r"""
    A class to instantiate a connection to Typesense, with the following configurations:
    * HTTP connection to localhost:8108
    * Connection timeout set to 300 seconds (5 minutes)
    * API key set to env variable named "TYPESENSE_API_KEY"
    """
    def __init__(self):
        self.TYPESENSE_API_KEY = os.environ.get("TYPESENSE_API_KEY")
        self.client = ts.Client({
            "nodes": [{"host": "localhost", "port": "8108", "protocol": "http"}],
            "api_key": self.TYPESENSE_API_KEY,
            "connection_timeout_seconds": 300
        })


class DataAccess:
    r"""
    A class that provides several helpful methods to interact with the connected Typesense instance. This class is specifically
    designed to facilitate the creation, deletion, authentication, and management of Objects involved in the intelligent job-matching platform.
    
    ## Args  
        **client**: *Connection*  
        An initialised Connection object connected to a Typesense instance. 

    ## Examples
        >>> connection = Connection()
    >>> db = DataAccess(connection)
    """
    def __init__(self, connection: Connection):
        self.client = connection.client
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

    def create_seeker(self, full_name: str, email: str, age: int, city: str, state: str, country: str, 
                     short_desc: str, bio: str, password: str) -> bool:
        r"""
        Create a seeker in the Typesense instance as a document in the collection "seekers." This requires all fields listed
        in the below "Args" section.<br>  
        The `password` field is to provided in a <u>plain-text</u> format, as encryption via hashing is already
        implemented and handled by this method.<br>  
        Returns True if a seeker is successfully inserted into Typesense, otherwise False if seeker with the provided email
        already exists, or if the password is an empty string.  

        ## Args
            **full_name**: *str*  
            **email**: *str*
            **age**: *int*
            **city**: *str*
            **state**: *str*
            **country**: *str*
            **short_desc**: *str*
            **bio**: *str*
            **password**: *str*<br>
            All fields above are required and mandatory.
        """
        # Check if email already exists
        if self.get_seeker_by_identifier(email=email):
            print("Email is already in use.")
            return False
        
        if not password.strip():
            print("Password must not be an empty string.")
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
            "password": generate_password_hash(password.strip())
        })
        return True

    def create_company(self, company_name: str, email: str, city: str, state: str, country: str, 
                      short_desc: str, bio: str, founded_year: int, industry: str, culture: str, password: str) -> bool:
        r"""
        Create a company/employer in the Typesense instance as a document in the collection "companies." This requires all fields listed
        in the below "Args" section.<br>  
        The `password` field is to provided in a <u>plain-text</u> format, as encryption via hashing is already
        implemented and handled by this method.<br>  
        Returns True if a company is successfully inserted into Typesense, otherwise False if seeker with the provided email
        already exists, or if the password is an empty string.  

        ## Args
            **company_name**: *str*  
            **email**: *str*
            **city**: *str*
            **state**: *str*
            **country**: *str*
            **short_desc**: *str*
            **bio**: *str*
            **founded_year**: *int*
            **industry**: *str*
            **culture**: *str*
            **password**: *str*<br>
            All fields above are required and mandatory.
        """
        # Check if email already exists
        if self.get_company_by_identifier(email=email):
            print("Email is already in use.")
            return False
        
        if not password.strip():
            print("Password must not be an empty string.")
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
            "password": generate_password_hash(password.strip())
        })
        return True 

    def authenticate_seeker(self, email: str, password: str) -> Seeker | None:
        r"""
        Authenticate a Seeker according to provided email and password.<br>  
        The `password` field is to provided in a <u>plain-text</u> format, as hashing is already
        implemented and handled by this method for authentication.<br>  
        Returns a Seeker object if authentication is successful, otherwise None. 
        
        ## Args  
            **email**: *str*
            **password**: *str*
        """
        # Check if user exists
        seeker = self.get_seeker_by_identifier(email=email)

        if not seeker:
            print(f"Seeker by the email {email} not found.")
            return None
        
        # Get Seeker object
        if check_password_hash(seeker.password, password):
            return seeker
        
        print(f"Authentication for {email} failed.")
        return None

    def authenticate_company(self, email: str, password: str) -> Company | None:
        r"""
        Authenticate a Company according to provided email and password.<br>  
        The `password` field is to provided in a <u>plain-text</u> format, as hashing is already
        implemented and handled by this method for authentication.<br>  
        Returns a Company object if authentication is successful, otherwise None. 
        
        ## Args  
            **email**: *str*
            **password**: *str*
        """
        # Check if user exists
        company = self.get_company_by_identifier(email=email)

        if not company:
            print(f"Company by the email {email} not found.")
            return None
        
        # Get Company object
        if check_password_hash(company.password, password):
            return company

        print(f"Authentication for {email} failed.")
        return None


    def get_seeker_by_identifier(self, seeker_id: str = None, email: str = None) -> Seeker | None:
        r"""
        Find a seeker by the provided identifier, either by the provided `seeker_id` or `email`. Only one identifier is sufficient
        for finding the desired seeker.<br>  
        Either `seeker_id` or `email` must be provided, if both fields are not provided, a TypeError will be raised. 
        If both parameters are provided, `seeker_id` will be used to return a seeker.<br>  
        Returns a Seeker object if a seeker associated to the provided identifier is found, otherwise None.

        ## Args
            **seeker_id**: *str*
            **email**: *str*

        ## Examples
            >>> db.get_seeker_by_identifier(seeker_id="1") # Valid
        >>> db.get_seeker_by_identifier(email="example@domain.com") # Valid  
        >>> db.get_seeker_by_identifier(seeker_id="1", email="example@domain.com")
        ... # Valid, but only seeker_id will be used for search
        >>> db.get_seeker_by_identifier() # Invalid
        """
        # seeker_id and email are not provided
        if seeker_id and email:
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
                return None
            
            result = result["hits"][0]["document"]
            seeker = Seeker(id=result["id"], full_name=result["full_name"], email=result["email"],
                              age=result["age"], city=result["city"], state=result["state"], country=result["country"],
                              short_desc=result["short_desc"], bio=result["bio"], membership=result["membership"])
            seeker.password = result["password"]
            return seeker
        
    
    def get_company_by_identifier(self, company_id: str = None, email: str = None) -> Company | None:
        r"""
        Find a company by the provided identifier, either by the provided `company_id` or `email`. Only one identifier is sufficient
        for finding the desired company.<br>  
        Either `company_id` or `email` must be provided, if both fields are not provided, a TypeError will be raised. 
        If both parameters are provided, `company_id` will be used to return a company.<br>  
        Returns a Company object if a company associated to the provided identifier is found, otherwise None.

        ## Args
            **company_id**: *str*
            **email**: *str*

        ## Examples
            >>> db.get_company_by_identifier(company_id="1") # Valid
        >>> db.get_company_by_identifier(email="example@domain.com") # Valid  
        >>> db.get_company_by_identifier(company_id="1", email="example@domain.com")
        ... # Valid, but only company_id will be used for search
        >>> db.get_company_by_identifier() # Invalid
        """
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
        r"""
        Create a resume in the Typesense instance as a document in the collection "resumes." This requires all fields listed
        in the below "Args" section.

        ## Args
            **seeker_id**: *str*
            **education**: *int*
            **experience**: *str*
            **skills**: *list[str]*
            **exp_years**: *int*
            **work_mode**: *list[str]*
            **field_of_study**: *list[str]*
            **preferred_city**: *str*
            **preferred_state**: *str*
            **preferred_country**: *str*  
        """
        
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
        r"""
        Create a jobposting in the Typesense instance as a document in the collection "jobpostings." This requires all fields listed
        in the below "Args" section. 

        ## Args
            **company_id**: *str*
            **title**: *str*
            **summary**: *str*
            **responsibilities**: *str*
            **required_education**: int
            **required_skills**: *list[str]*
            **exp_years**: *int*
            **work_mode**: *list[str]*
            **field_of_study**: *list[str]*
            **city**: *str*
            **state**: *str*
            **country**: *str*  
        """
        
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

    def delete_resume(self, resume_id: str):
        r"""
        Delete a resume in the Typesense instance from the collection "resumes" identified by `resume_id`.<br>  
        If no resumes are found and deleted, a notice message will be printed to the terminal.     

        ## Args
            **resume_id**: *str*
        """
        response = self.client.collections["resumes"].documents.delete({"filter_by": f"id:={resume_id}"})
        # Nothing was deleted
        if response["num_deleted"] < 1:
            print(f"Resume with id {resume_id} was not found. Nothing was deleted.")

    def delete_jobposting(self, jobposting_id: str):
        r"""
        Delete a jobposting in the Typesense instance from the collection "jobpostings" identified by `jobposting_id`.<br>  
        If no jobpostings are found and deleted, a notice message will be printed to the terminal.     

        ## Args
            **jobposting_id**: *str*
        """
        response = self.client.collections["jobpostings"].documents.delete({"filter_by": f"id:={jobposting_id}"})
        # Nothing was deleted
        if response["num_deleted"] < 1:
            print(f"JobPosting with id {jobposting_id} was not found. Nothing was deleted.")

    def get_resume_by_id(self, resume_id: str) -> Resume | None:
        r"""
        Find a resume by the provided `resume_id` identifier.<br>  
        Returns a Resume object if a resume associated to the provided identifier is found, otherwise None.

        ## Args
            **resume_id**: *str*

        ## Examples
            >>> db.get_resume_by_id(resume_id="1") # Valid
        >>> db.get_resume_by_id() # Invalid
        """
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
        
    def get_jobposting_by_id(self, jobposting_id: str) -> JobPosting | None:
        r"""
        Find a jobposting by the provided `jobposting_id` identifier.<br>  
        Returns a JobPosting object if a jobposting associated to the provided identifier is found, otherwise None.

        ## Args
            **jobposting_id**: *str*

        ## Examples
            >>> db.get_jobposting_by_id(jobposting_id="1") # Valid
        >>> db.get_jobposting_by_id() # Invalid
        """
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
    
    def get_all_resumes_by_seeker(self, seeker_id: str = None, page_number: int = 1) -> list[Resume]:
        r"""
        Find all resumes associated to a `seeker_id`.<br>  
        Returns a **list[Resume]** object if resumes associated to the provided `seeker_id` are found, otherwise an empty list.<br>  
        Pagination is supported by this method.
        By default, returns a list of maximum 20 resumes per page. Use the `page_number` parameter to request for the
        next 20 resumes.

        ## Args
            **seeker_id**: *str*
            **page_number**: *int* | default = 1 (Optional)

        ## Examples
            >>> db.get_all_resumes_by_seeker(seeker_id="1") 
        ... # Valid, returns the first 20 resumes for this seeker
        >>> db.get_all_resumes_by_seeker(seeker_id="1", page_number=1) 
        ... # Valid, identical to the above
        >>> db.get_all_resumes_by_seeker(seeker_id="1", page_number=2)
        ... # Valid, returns the next 20 resumes for this seeker 
        """

        result = self.client.collections["resumes"].documents.search({
            "q": "*",
            "filter_by": f"seeker_id:={seeker_id}" if seeker_id else "",
            "page": page_number,
            "per_page": 20,
            "include_fields": "$seekers(full_name, email)"
        })

        resume_list = self._json_to_resume_list(result)
        return resume_list
    
    def get_all_jobpostings_by_company(self, company_id: str = None, page_number: int = 1) -> list[JobPosting]:
        r"""
        Find all jobpostings associated to a `company_id`.<br>  
        Returns a **list[JobPosting]** object if jobpostings associated to the provided `company_id` are found, otherwise an empty list.<br>  
        Pagination is supported by this method.
        By default, returns a list of maximum 20 jobpostings per page. Use the `page_number` parameter to request for the
        next 20 jobpostings.

        ## Args
            **company_id**: *str*
            **page_number**: *int* | default = 1 (Optional)

        ## Examples
            >>> db.get_all_jobpostings_by_company(company_id="1") 
        ... # Valid, returns the first 20 jobpostings for this company
        >>> db.get_all_jobpostings_by_company(company_id="1", page_number=1) 
        ... # Valid, identical to the above
        >>> db.get_all_jobpostings_by_company(company_id="1", page_number=2)
        ... # Valid, returns the next 20 jobpostings for this company 
        """

        result = self.client.collections["jobpostings"].documents.search({
            "q": "*",
            "filter_by": f"company_id:={company_id}" if company_id else "",
            "page": page_number,
            "per_page": 20,
            "include_fields": "$companies(company_name, email)"
        })

        jobposting_list = self._json_to_jobposting_list(result)
        return jobposting_list
    
    def query_resume(self, query_text: str = "", skills: list[str] = None, education: int = None, 
                     exp_years: int = None, work_mode: list[str] = None, field_of_study: list[str] = None,
                     preferred_city: str = None, preferred_state: str = None, preferred_country: str = None,
                     page_number: int = 1) -> list[Resume]:
        r"""
        Find resumes relevant to the provided parameters. See the "Args" section for more detail.<br>  
        All fields listed in the "Args" section below are optional. Any parameters can be passed or left empty
        to return relevant resumes. Parameters left empty are **implicitly** set to <u>None</u>. Searches done with some parameters left empty 
        or passed in as None will return results based on other non-None parameters provided in the method call.<br>  
        If **all fields are left empty**, the method returns **ALL** resumes from the "resumes" collection
        in the Typesense instance.<br>  
        Returns a **list[Resume]** object if resumes matching the search criteria are found, otherwise an empty list.<br>  
        Pagination is supported by this method.
        By default, returns a list of maximum 20 resumes per page. Use the `page_number` parameter to request for the
        next 20 resumes.

        ## Args (All Optional)
            ### Search bar parameters
            **query_text**: *str*  
            Text entered in the search bar.
            <br>  
            ### Hard filter parameters
            **skills**: *list[str]*
            **education**: *int*
            **exp_years**: *int*
            **work_mode**: *list[str]*
            **field_of_study**: *list[str]*
            **preferred_city**: *str*
            **preferred_state**: *str*
            **preferred_country**: *str*
            <br>
            ### Pagination support
            **page_number**: *int*
        <br>  

        ## Examples
            >>> db.query_resume()
        ... # Valid, returns the first 20 of ALL resumes found in Typesense
        >>> db.query_resume(query_text=None, skills=None, education=None, 
        ...                 exp_years=None, work_mode=None, field_of_study=None,
        ...                 preferred_city=None, preferred_state=None, preferred_country=None)
        ... # Valid, identical to the above
        >>> db.query_resume(page_number=2)
        ... # Valid, returns the next 20 of ALL resumes found in Typesense
        >>> db.query_resume(query_text="Optimis") 
        ... # Valid, returns the first 20 resumes that contain the substring "Optimis"
        >>> db.query_resume(query_text="Optimis", page_number=1) 
        ... # Valid, identical to the above
        >>> db.query_resume(query_text="Optimis", page_number=2)
        ... # Valid, returns the next 20 resumes that contain the substring "Optimis"
        >>> db.query_resume(query_text="Optimis", skills=["Vue 3", "Django", "Python"], education=6, 
        ...                 work_mode=["Remote", "Hybrid"], preferred_state="New South Wales")
        ... # Valid, returns the first 20 resumes that match the above criteria
        """
        
        field_names = ["skills", "education", "preferred_city", "preferred_state", "preferred_country"]
        result = self.client.collections["resumes"].documents.search({
            "q": f"{"*" if not query_text or not query_text.strip() else query_text.strip()}",
            "query_by": "experience, skills, field_of_study",
            "filter_by": self._build_filter(field_names, skills, education,
                                           exp_years, work_mode, field_of_study,
                                           preferred_city, preferred_state, preferred_country),
            "page": page_number,
            "per_page": 20,
            "num_typos": 5,
            "include_fields": "$seekers(full_name, email)"
        })

        resume_list = self._json_to_resume_list(result)
        return resume_list
    
    def query_jobposting(self, query_text: str = "", required_skills: list[str] = None, required_education: int = None, 
                     exp_years: int = None, work_mode: list[str] = None, field_of_study: list[str] = None,
                     city: str = None, state: str = None, country: str = None, page_number: int = 1) -> list[JobPosting]:
        r"""
        Find jobpostings relevant to the provided parameters. See the "Args" section for more detail.<br>  
        All fields listed in the "Args" section below are optional. Any parameters can be passed or left empty
        to return relevant jobpostings. Parameters left empty are **implicitly** set to <u>None</u>. Searches done with some parameters left empty 
        or passed in as None will return results based on other non-None parameters provided in the method call.<br>  
        If **all fields are left empty** or passed in as None, the method returns **ALL** jobpostings from the "jobpostings" collection
        in the Typesense instance.<br>  
        Returns a **list[JobPosting]** object if jobpostings matching the search criteria are found, otherwise an empty list.<br>  
        Pagination is supported by this method.
        By default, returns a list of maximum 20 jobpostings per page. Use the `page_number` parameter to request for the
        next 20 jobpostings.

        ## Args (All Optional)
            ### Search bar parameters
            **query_text**: *str*  
            Text entered in the search bar.
            <br>  
            ### Hard filter parameters
            **required_skills**: *list[str]*
            **required_education**: *int*
            **exp_years**: *int*
            **work_mode**: *list[str]*
            **field_of_study**: *list[str]*
            **city**: *str*
            **state**: *str*
            **country**: *str*
            <br>
            ### Pagination support
            **page_number**: *int*
        <br>  

        ## Examples
            >>> db.query_jobposting()
        ... # Valid, returns the first 20 of ALL jobpostings found in Typesense
        >>> db.query_jobposting(self, query_text=None, required_skills=None, required_education=None, 
        ...                     exp_years=None, work_mode=None, field_of_study=None,
        ...                     city=None, state=None, country=None)
        ... # Valid, identical to the above
        >>> db.query_jobposting(page_number=2)
        ... # Valid, returns the next 20 of ALL jobpostings found in Typesense
        >>> db.query_jobposting(query_text="Develop") 
        ... # Valid, returns the first 20 jobpostings that contain the substring "Develop"
        >>> db.query_jobposting(query_text="Develop", page_number=1) 
        ... # Valid, identical to the above
        >>> db.query_jobposting(query_text="Develop", page_number=2)
        ... # Valid, returns the next 20 jobpostings that contain the substring "Develop"
        >>> db.query_jobposting(query_text="Develop", required_skills=["SQL Server", "MongoDB", "Redis"],  
        ...                     required_education=5, work_mode=["Remote", "Hybrid", "On-site"], 
        ...                     state="Australian Capital Territory")
        ... # Valid, returns the first 20 jobpostings that match the above criteria
        """
        
        field_names = ["required_skills", "required_education", "city", "state", "country"]
        result = self.client.collections["jobpostings"].documents.search({
            "q": f"{"*" if not query_text or not query_text.strip() else query_text.strip()}",
            "query_by": "title, summary, responsibilities, required_skills, field_of_study",
            "filter_by": self._build_filter(field_names, required_skills, required_education,
                                           exp_years, work_mode, field_of_study,
                                           city, state, country),
            "page": page_number,
            "per_page": 20,
            "num_typos": 5,
            "include_fields": "$companies(company_name, email)"
        })

        jobposting_list = self._json_to_jobposting_list(result)
        return jobposting_list
    
    def rank_resumes_by_jobposting(self, jobposting_id: str, page_number: int = 1) -> list[Resume]:
        r"""
        Rank Top-K resumes according to its relevance to the jobposting identified by the provided `jobposting_id`.<br>  
        Returns a **list[Resume]** object if relevant resumes are found AND if the jobposting by the provided 
        `jobposting_id` exists, otherwise an empty list.<br>  
        The ranking is done through a hybrid search in Typesense, where keyword matching, vector similarity, and hard filters are utilised
        to produce the final list of Top-K resumes found to be the most relevant to the provided jobposting. The vectors are generated
        by the embedding model specified by the `model` attribute in the `DataAccess` instance.<br>  
        Top-K is determined by the jobposting's owner's membership status; where K is "unlimited" if a member or 10 otherwise.<br>
        Pagination is supported by this method.<br>  
        By default, returns a list of maximum 20 resumes per page. Use the `page_number` parameter to request for the
        next 20 resumes. No extra parameters are required by this method, as the search is always done through the contents of the provided jobposting.  

        ## Args
            **jobposting_id**: *str*
            **page_number**: *int*  
        """
        jobposting_to_use = self.get_jobposting_by_id(jobposting_id)
        owned_by_company = self.get_company_by_identifier(jobposting_to_use.company_id)

        # Set to the total number of resumes for "unlimited recommendations" if a member
        # Set k = 10 if not a member
        return_top_k = self.client.collections["resumes"].retrieve()["num_documents"] if owned_by_company.membership else 10
        
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
                    "page": page_number,
                    "per_page": 20,
                    "include_fields": "$seekers(full_name, email)"
            }]})

            resume_list = self._json_to_resume_list(result["results"][0])
            return resume_list
        return []
    
    def rank_jobpostings_by_resume(self, resume_id: str, page_number: int = 1) -> list[JobPosting]:
        r"""
        Rank Top-K jobpostings according to its relevance to the resume identified by the provided `resume_id`.<br>  
        Returns a **list[JobPosting]** object if relevant jobpostings are found AND if the resume_id by the provided 
        `resume_id` exists, otherwise an empty list.<br>  
        The ranking is done through a hybrid search in Typesense, where keyword matching, vector similarity, and hard filters are utilised
        to produce the final list of Top-K jobpostings found to be the most relevant to the provided resume. The vectors are generated
        by the embedding model specified by the `model` attribute in the `DataAccess` instance.<br>  
        Top-K is determined by the resume's owner's membership status; where K is "unlimited" if a member or 10 otherwise.<br>
        Pagination is supported by this method.<br>  
        By default, returns a list of maximum 20 jobpostings per page. Use the `page_number` parameter to request for the
        next 20 jobpostings. No extra parameters are required by this method, as the search is always done through the contents of the provided resume.  

        ## Args
            **resume_id**: *str*
            **page_number**: *int*  
        """
        resume_to_use = self.get_resume_by_id(resume_id)
        owned_by_seeker = self.get_seeker_by_identifier(resume_to_use.seeker_id)

        # Set to the total number of job postings for "unlimited recommendations" if a member
        # Set k = 10 if not a member
        return_top_k = self.client.collections["jobpostings"].retrieve()["num_documents"] if owned_by_seeker.membership else 10
        
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
                    "page": page_number,
                    "per_page": 20,
                    "include_fields": "$companies(company_name, email)"
            }]})

            jobposting_list = self._json_to_jobposting_list(result["results"][0])
            return jobposting_list
        return []

    def _build_filter(self, field_names: list[str], skills: list[str] = None, education: int = None, 
                     exp_years: int = None, work_mode: list[str] = None, field_of_study: list[str] = None,
                     city: str = None, state: str = None, country: str = None) -> str:
        r"""
        For internal use only. Dynamically build and return the `filter_by` string as part of a parameter in a Typesense query JSON request.<br>  
        Considering the combinatorial explosion of possible filter combinations caused by the number of fields used as filters
        in the system, this provides an elegant way to append conditions depending on attributes that are actually set
        in the filters.<br>  
        This method can be used anywhere a `filter_by` string needs to be used for building a Typesense query,
        assuming the query uses the same set of filters featuring attributes supported by the method.
        See the "Args" section for more detail.

        ## Args
            ### Required
            **field_names**: *list[str]*
            The field names specifically referencing the skills-, education-, city-, state-, and country-like attributes
            as named in a given Typesense collection. Implemented to explicitly support the slight differences in naming
            between the **resumes** and **jobpostings** collections.<br>    
            <br>  
            ### Optional
            **skills**: *list[str]*
            The list of skills to include as part of the query condition.<br>  
            **education**: *int*
            The education level to include as part of the query condition.<br>  
            **exp_years**: *int*
            The number of years of experience to include as part of the query condition.<br>  
            **work_mode**: *list[str]*
            The list of work modes to include as part of the query condition.<br>  
            **field_of_study**: *list[str]*
            The list of field of study tags to include as part of the query collection.<br>  
            **city**: *str*
            The city name to include as part of the query collection.<br>  
            **state**: *str*
            The state name to include as part of the query collection.<br>  
            **country**: *str*
            The country name to include as part of the query collection.<br>  
        """

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
    
    def _json_to_resume_list(self, json_response) -> list[Resume]:
        r"""
        For internal use only. Transform the raw JSON response returned by Typesense into list of resumes in the format
        of **list[Resume]**.<br>  
        Returns a **list[Resume]** object if the response contains resume results, otherwise an empty list.<br>   
        This method can be used anywhere a raw JSON response string needs to be transformed into an object form for smoother
        OOP processing.

        ## Args
            **json_response**: *dict*
            A raw JSON response returned from a Typesense query. This requires the `hits` portion to be exposed as a 
            top-level key-value pair in the response body.  
        """

        # No resumes found
        if len(json_response["hits"]) == 0:
            print("No resumes found for the given query.")
            return []

        resume_list = []
        for resume_data in json_response["hits"]:
            resume_data = resume_data["document"]
            resume_to_append = Resume(id=resume_data["id"], seeker_id=resume_data["seeker_id"],
                                        education={resume_data["education"]: self._map_int_to_education(resume_data["education"])},
                                        experience=resume_data["experience"], skills=resume_data["skills"], exp_years=resume_data["exp_years"],
                                        work_mode=resume_data["work_mode"], field_of_study=resume_data["field_of_study"], 
                                        preferred_city=resume_data["preferred_city"], preferred_state=resume_data["preferred_state"], 
                                        preferred_country=resume_data["preferred_country"], resume_embedding=resume_data["resume_embedding"])
            resume_to_append.seeker_full_name = resume_data["seekers"]["full_name"]
            resume_to_append.seeker_email = resume_data["seekers"]["email"]
            resume_list.append(resume_to_append)
            
        return resume_list
    
    def _json_to_jobposting_list(self, json_response) -> list[JobPosting]:
        r"""
        For internal use only. Transform the raw JSON response returned by Typesense into list of jobpostings in the format
        of **list[JobPosting]**.<br>  
        Returns a **list[JobPosting]** object if the response contains jobposting results, otherwise an empty list.<br>   
        This method can be used anywhere a raw JSON response string needs to be transformed into an object form for smoother
        OOP processing.

        ## Args
            **json_response**: *dict*
            A raw JSON response returned from a Typesense query. This requires the `hits` portion to be exposed as a 
            top-level key-value pair in the response body.  
        """
        # No job postings found
        if len(json_response["hits"]) == 0:
            print("No job postings found for given Company.")
            return []
        
        jobposting_list = []
        for jobposting_data in json_response["hits"]:
            jobposting_data = jobposting_data["document"]
            jobposting_to_append = JobPosting(id=jobposting_data["id"], company_id=jobposting_data["company_id"], title=jobposting_data["title"],
                                              summary=jobposting_data["summary"], responsibilities=jobposting_data["responsibilities"],
                                              required_education={jobposting_data["required_education"]: self._map_int_to_education(jobposting_data["required_education"])}, 
                                              required_skills=jobposting_data["required_skills"], 
                                              exp_years=jobposting_data["exp_years"], work_mode=jobposting_data["work_mode"], 
                                              field_of_study=jobposting_data["field_of_study"], city=jobposting_data["city"], state=jobposting_data["state"], 
                                              country=jobposting_data["country"], jobposting_embedding=jobposting_data["jobposting_embedding"])
            jobposting_to_append.company_name = jobposting_data["companies"]["company_name"]
            jobposting_to_append.company_email = jobposting_data["companies"]["email"]
            jobposting_list.append(jobposting_to_append)

        return jobposting_list
    
    def _map_int_to_education(self, education_index: int) -> str:
        r"""
        For internal use only. Maps an integer to its corresponding education level. Required for the ordinal categorical attribute `education` / `required_education`.<br>  
        Returns a string describing the education level according to the integer provided by `education_index`. `education_index` ranges from
        1 to 10, any other integer will result in a KeyError.<br>  
        This can be used wherever a mapping from **education level integers** to **education level names** is required, such as
        for converting education fields of <u>returned Typesense documents</u> to names for <u>display on the frontend</u>.

        ## Args
            **education_index**: *int*
            An integer representing the education level, bounded from 1–10.
        """

        education_levels = {
            1: "None", 
            2: "Secondary", 
            3: "Certificate I-II", 
            4: "Certificate III-IV", 
            5: "Diploma", 
            6: "Advanced Diploma / Associate Degree",
            7: "Bachelor", 
            8: "Bachelor Honours / Graduate Certificate / Graduate Diploma", 
            9: "Master", 
            10: "PhD / Doctoral"
        }
        return education_levels[education_index]
    
    def _map_education_to_int(self, education_name: str) -> int:
        r"""
        For internal use only. Maps an education level name to its corresponding integer. Required for the ordinal categorical attribute `education` / `required_education`.<br>  
        Returns an integer according to the the education level name provided by `education_name`. `education_name` covers ten different levels of education,
        see the "Args" section for more detail. Any other education level name will result in a KeyError.<br>  
        This can be used wherever a mapping from **education level names** to **education level integers** is required, such as
        when <u>querying Typesense collections</u>.

        ## Args
            **education_name**: *str*
            A string naming the education level. Provide any of the following valid strings:
                * None
                * Secondary
                * Certificate I-II
                * Certificate III-IV 
                * Diploma
                * Advanced Diploma / Associate Degree
                * Bachelor 
                * Bachelor Honours / Graduate Certificate / Graduate Diploma 
                * Master
                * PhD / Doctoral
        """

        education_levels = {
            "None": 1, 
            "Secondary": 2, 
            "Certificate I-II": 3, 
            "Certificate III-IV": 4, 
            "Diploma": 5, 
            "Advanced Diploma / Associate Degree": 6,
            "Bachelor": 7, 
            "Bachelor Honours / Graduate Certificate / Graduate Diploma": 8, 
            "Master": 9, 
            "PhD / Doctoral": 10
        }
        return education_levels[education_name]


class EnumGetter:
    r"""
    A class that returns all unique values of enum-type variables. This includes fields with predefined values, fields with user-defined values,
    and fields where integers correspond to certain ordinal concepts.<br>  
    For fields with user-defined values, all unique values are returned from the connected Typesense instance, within the context of certain collections.<br>  
    This class is specifically designed to provide the backend and frontend with unique values for the fields `education` / `required_education`, `work_mode`, `field_of_study`,
    `skills` / `required_skills`, `preferred_city` / `city`, `preferred_state` / `state`, and `preferred_country` / `country` involved in the intelligent job-matching platform.
    This primarily serves two purposes:  
    * Get values to be included in the filter options for each attribute for a given workflow (seeker or company) during a search operation,
    * Get values to offer as selections for some fields to the user during account and resume / jobposting creation.

    
    ## Args  
        **client**: *Connection*  
        An initialised Connection object connected to a Typesense instance. 

    ## Examples
        >>> connection = Connection()
    >>> eg = EnumGetter(connection)
    """
    def __init__(self, connection: Connection):
        self.client = connection.client
    
    def get_education_levels(self) -> dict:
        r"""
        Returns a dictionary of all education levels by integer and name used by the intelligent job-matching platform,
        primarily for display purposes for selections on the frontend.
        """
        return {
            1: "None", 
            2: "Secondary", 
            3: "Certificate I-II", 
            4: "Certificate III-IV", 
            5: "Diploma", 
            6: "Advanced Diploma / Associate Degree",
            7: "Bachelor", 
            8: "Bachelor Honours / Graduate Certificate / Graduate Diploma", 
            9: "Master", 
            10: "PhD / Doctoral"
        }
    
    def get_work_modes(self) -> list[str]:
        r"""
        Returns the list of all work modes supported by the intelligent job-matching platform.
        """
        return ["On-site", "Remote", "Hybrid"]

    def get_fields_of_study(self) -> list[str]:
        r"""
        Returns the list of all predefined fields of study used by the intelligent job-matching platform.
        """
        return ["Computer Science", "Artificial Intelligence", "Computer Vision", "Robotics",
                "Software Engineering", "Data Analytics", "Machine Learning", "Deep Learning",
                "Web Development", "Mobile Development", "UI/UX", "Cloud Computing", "Cluster Computing",
                "Database Management", "Computer Networking", "Operating Systems", "Cybersecurity", "Logging and Monitoring"]
    
    def get_unique_skills(self, workflow: str) -> list[str]:
        r"""
        Returns a list of all unique skills found in the Typesense instance, within the collection referenced by `workflow`.<br>  
        Used for providing a selection of options in the hard filters section for the `skills` / `required_skills` attributes
        for the general search functionality.<br>  
        The `workflow` parameter determines the collection from which to return the set of unique skills. See the "Args" section
        for more detail. Other unrecognised workflow names will result in the return of an empty list.

        ## Args
            **workflow**: *str*
            The name of workflow for which to return unique skills. Can be either '**seeker**' or '**company**.'
            Use the correct workflow name depending on the type of workflow within which the search functionality is involved.
            For instance, for the searching of jobpostings in the **seeker** workflow, use 'seeker' as the parameter, and vice versa.
        """
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
    
    def get_unique_locations(self, workflow: str) -> dict:
        r"""
        Returns a dictionary of all unique locational data found in the Typesense instance, within the collection referenced by `workflow`, in the
        format:  
        {  
            **"cities"**: *list[str]*,   
            **"states"**: *list[str]*,  
            **"countries"**: *list[str]*    
        }<br>  
        Used for providing a selection of options in the hard filters section for the `preferred_city` / `city`, `preferred_state` / `state`,
        and `preferred_country` / `country` attributes for the general search functionality.<br>  
        The `workflow` parameter determines the collection from which to return the set of unique locational information. See the "Args" section
        for more detail. Other unrecognised workflow names will result in the return of an empty dictionary.  

        ## Args
            **workflow**: *str*
            The name of workflow for which to return unique locational data. Can be either '**seeker**' or '**company**.'
            Use the correct workflow name depending on the type of workflow within which the search functionality is involved.
            For instance, for the searching of jobpostings in the **seeker** workflow, use 'seeker' as the parameter, and vice versa.
        """

        if workflow != "seeker" and workflow != "company":
            print("Invalid workflow name. Please pass either 'seeker' or 'company' for the workflow parameter.")
            return {}

        result = {}
        if workflow == "seeker":
            result = self.client.collections["jobpostings"].documents.search({
                "q": "*",
                "query_by": "city, state, country",
                "facet_by": "city, state, country",
                "max_facet_values": 300
            })

        if workflow == "company":
            result = self.client.collections["resumes"].documents.search({
                "q": "*",
                "query_by": "preferred_city, preferred_state, preferred_country",
                "facet_by": "preferred_city, preferred_state, preferred_country",
                "max_facet_values": 300
            })
        
        return {
            "cities": [f["value"] for f in result["facet_counts"][0]["counts"]],
            "states": [f["value"] for f in result["facet_counts"][1]["counts"]],
            "countries": [f["value"] for f in result["facet_counts"][2]["counts"]]
        }      
    
# Testing

# connection = Connection()

# db = DataAccess(connection)
# eg = EnumGetter(connection)

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

# resume = db.get_resume_by_id("2")
# print(resume.seeker_full_name, resume.seeker_email)

# jobposting = db.get_jobposting_by_id("6")
# print(jobposting.company_name, jobposting.company_email)

# jps = db.get_all_jobpostings_by_company("3")
# print(jps)
# for jp in jps:
#     print(jp.company_name, jp.company_email)

# rsms = db.get_all_resumes_by_seeker("7")
# print(rsms)
# for rsm in rsms:
#     print(rsm.seeker_full_name, rsm.seeker_email)

# q_rsm = db.query_resume("Optimis")
# for q in q_rsm:
#     print(q.seeker_full_name, q.seeker_email)

# q_jp = db.query_jobposting("Develop")
# for q in q_jp:
#     print(q.company_name, q.company_email)

# rsm_ranked = db.rank_resumes_by_jobposting("11")
# for rsm in rsm_ranked:
#     print(rsm.seeker_full_name, rsm.seeker_email)

# jp_ranked = db.rank_jobpostings_by_resume("7")
# for jp in jp_ranked:
#     print(jp.company_name, jp.company_email)