class Seeker:
    def __init__(self, full_name: str, email: str, age: int, city: str, state: str, country: str, short_desc: str, bio: str, membership: bool, id=None):
        self.id = id
        self.full_name = full_name
        self.email = email
        self.age = age
        self.city = city
        self.state = state
        self.country = country
        self.short_desc = short_desc
        self.bio = bio
        self.membership = membership

    def __repr__(self):
        return f"<Seeker ({self.id})>"
    

class Company:
    def __init__(self, company_name: str, email: str, city: str, state: str, country: str, short_desc: str, bio: str, founded_year: int, industry: str, culture: str, membership: bool, id=None):
        self.id = id
        self.company_name = company_name
        self.email = email
        self.city = city
        self.state = state
        self.country = country
        self.short_desc = short_desc
        self.bio = bio
        self.founded_year = founded_year
        self.industry= industry
        self.culture = culture
        self.membership = membership

    def __repr__(self):
        return f"<Company ({self.id})>"

class Resume:
    def __init__(self, seeker_id: str, education: dict, experience: str, skills: list[str], exp_years: int, work_mode: list[str], field_of_study: list[str], preferred_city: str, preferred_state: str, preferred_country: str, resume_embedding: list[float], id=None):
        self.id = id
        self.seeker_id = seeker_id
        self.education = education
        self.experience = experience
        self.skills = skills
        self.exp_years = exp_years
        self.work_mode = work_mode
        self.field_of_study = field_of_study
        self.preferred_city = preferred_city
        self.preferred_state = preferred_state
        self.preferred_country = preferred_country
        self.resume_embedding = resume_embedding

    def __repr__(self):
        return f"<Resume ({self.id})>"

class JobPosting:
    def __init__(self, company_id: str, title: str, summary: str, responsibilities: str, required_education: dict, required_skills: list[str], exp_years: int, work_mode: list[str], field_of_study: list[str], city: str, state: str, country: str, jobposting_embedding: list[float], id=None):
        self.id = id
        self.company_id = company_id
        self.title = title
        self.summary = summary
        self.responsibilities = responsibilities
        self.required_education = required_education
        self.required_skills = required_skills
        self.exp_years = exp_years
        self.work_mode = work_mode
        self.field_of_study = field_of_study
        self.city = city
        self.state = state
        self.country = country
        self.jobposting_embedding = jobposting_embedding

    def __repr__(self):
        return f"<JobPosting ({self.id})>"