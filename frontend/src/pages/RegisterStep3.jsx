import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepIndicator from '../components/StepIndicator'

export default function RegisterStep3({ API_BASE_URL }) {
  const navigate = useNavigate()
  const { role } = useParams()
  const [loading, setLoading] = useState(false)

  const step1 = JSON.parse(sessionStorage.getItem('reg_step1') || '{}')
  const step2 = JSON.parse(sessionStorage.getItem('reg_step2') || '{}')

  const handleRegister = async () => {
    if (!step1.email || !step1.password) {
      alert('Registration data is missing. Please start from Step 1.')
      navigate(`/register/${role}/step1`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/register/seeker`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: step1.email,
          password: step1.password,
          name: step1.fullName,
          age: step2.age ? parseInt(step2.age) : null,
          city: step2.city || '',
          state: step2.state || '',
          country: step2.country || '',
          short_desc: step2.shortDesc || '',
          bio: step2.bio || '',
          education: step2.eduLevel || 7,
          experience: step2.experience || '',
          skills: step2.skills || [],
          exp_years: step2.expYears ? parseInt(step2.expYears) : 0,
          work_mode: step2.workModes || [],
          field_of_study: step2.fieldOfStudy || [],
          preferred_city: step2.preferredCity || '',
          preferred_state: step2.preferredState || '',
          preferred_country: step2.preferredCountry || '',
        }),
      })

      if (response.status === 201) {
        sessionStorage.setItem('user_type', 'seeker')
        sessionStorage.removeItem('reg_step1')
        sessionStorage.removeItem('reg_step2')
        navigate('/dashboard')
      } else if (response.status === 400) {
        alert('An account with this email already exists. Please log in.')
        navigate('/login')
      } else {
        alert('Server error. Please try again later.')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const location = [step2.city, step2.state, step2.country].filter(Boolean).join(', ') || '—'

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
              <div className="review-row"><span>Full Name</span><span>{step1.fullName || '—'}</span></div>
              <div className="review-row"><span>Email</span><span>{step1.email || '—'}</span></div>
            </div>

            <div className="review-section">
              <div className="review-section-header">
                <h3>Profile Details</h3>
                <button className="edit-link" onClick={() => navigate(`/register/${role}/step2`)}>Edit</button>
              </div>
              <div className="review-row"><span>Location</span><span>{location}</span></div>
              <div className="review-row"><span>Education Level</span><span>{step2.eduLevel || '—'}</span></div>
              <div className="review-row"><span>Fields of Study</span><span>{step2.fieldOfStudy?.join(', ') || '—'}</span></div>
              <div className="review-row"><span>Skills</span><span>{step2.skills?.join(', ') || '—'}</span></div>
              <div className="review-row"><span>Work Mode</span><span>{step2.workModes?.join(', ') || '—'}</span></div>
            </div>

            <p className="review-note">
              By creating an account you agree to our <a href="#" className="form-link">Terms of Service</a> and <a href="#" className="form-link">Privacy Policy</a>.
            </p>

            <button className="btn-primary btn-wide" onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
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
