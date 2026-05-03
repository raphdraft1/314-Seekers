import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepIndicator from '../components/StepIndicator'

export default function RegisterStep3() {
  const navigate = useNavigate()
  const { role } = useParams()

  const handleRegister = async () => {

    //Heyaa! This should work for registration (company and seeker) and the backend is alr in place. Just plug in the values from the form. If you need to change the variable names, change them after the ":" to whichever you set it to. Ive just put "form.var" as placeholders for now.
    
    if (role === "seeker") {
      //Send registration and resume details to backend
      const response = await fetch(`${API_BASE_URL}/register/seeker`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          //User account variables
          email: form.email,
          password: form.password,
          name: form.fullName,
          age: form.age,
          city: form.city,
          state: form.state,
          country: form.country,
          short_desc: form.shortDesc,
          bio: form.bio,

          //Resume variables
          education: form.education,
          experience: form.experience,
          skills: form.skills,
          exp_years: form.expYears,
          work_mode: form.workMode,
          field_of_study: form.fieldOfStudy,
          preferred_city: form.preferredCity,
          preferred_state: form.preferredState,
          preferred_country: form.preferredCountry
        }) })
      
        if (response.status === 201) {
          alert('Account created!')
          navigate('/dashboard') //change to dash actual name
        }
        else if (response.status === 400) {
          alert("An account connected to this email already exists. Please log in.")
          navigate('/login')
        }
        else alert("Server error. Please try again later.")
    }
    else {
      //Company registration
      const response = await fetch(`${API_BASE_URL}/register/company`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          //Company account variables
          email: form.email,
          password: form.password,
          name: form.fullName,
          city: form.city,
          state: form.state,
          country: form.country,
          short_desc: form.shortDesc,
          bio: form.bio,
          fYear: form.fYear,
          industry: form.industry,
          culture: form.culture
        }) })
      
        if (response.status === 201) {
          alert('Account created!')
          navigate('/dashboard') //change to dash actual name
        }
        else if (response.status === 400) {
          alert("An account connected to this email already exists. Please log in.")
          navigate('/login')
        }
        else alert("Server error. Please try again later.")


    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="form-body">
        <div className="form-card">
          <h2 className="form-title">STEP 3: REVIEW</h2>
          <StepIndicator currentStep={3} />

          <div className="review-body">
            <div className="review-section">
              <div className="review-section-header">
                <h3>Basic Information</h3>
                <button className="edit-link" onClick={() => navigate(`/register/${role}/step1`)}>Edit</button>
              </div>
              <div className="review-row"><span>Full Name</span><span>—</span></div>
              <div className="review-row"><span>Email</span><span>—</span></div>
            </div>

            <div className="review-section">
              <div className="review-section-header">
                <h3>Profile Details</h3>
                <button className="edit-link" onClick={() => navigate(`/register/${role}/step2`)}>Edit</button>
              </div>
              <div className="review-row"><span>Education Level</span><span>—</span></div>
              <div className="review-row"><span>Field of Study</span><span>—</span></div>
              <div className="review-row"><span>Experience</span><span>—</span></div>
              <div className="review-row"><span>Work Type</span><span>—</span></div>
            </div>

            <p className="review-note">
              By creating an account you agree to our <a href="#" className="form-link">Terms of Service</a> and <a href="#" className="form-link">Privacy Policy</a>.
            </p>

            <button className="btn-primary btn-wide" onClick={handleRegister}>
              Create Account
            </button>

            <div className="form-nav" style={{ marginTop: '12px' }}>
              <button className="btn-secondary" onClick={() => navigate(`/register/${role}/step2`)}>Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
