import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepIndicator from '../components/StepIndicator'

export default function EmployerStep3() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const profile = JSON.parse(sessionStorage.getItem('employerProfile') || '{}')
  const step1 = JSON.parse(sessionStorage.getItem('reg_step1') || '{}')

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || '—'

  const handleRegister = async () => {
    if (!step1.email || !step1.password) {
      alert('Registration data is missing. Please start from Step 1.')
      navigate('/register/company/step1')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/register/company`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: step1.email,
          password: step1.password,
          name: step1.fullName,
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || '',
          short_desc: profile.shortDescription || '',
          bio: profile.bio || '',
          fYear: profile.foundedYear ? parseInt(profile.foundedYear) : null,
          industry: profile.industry || '',
          culture: profile.culture || '',
        }),
      })

      if (response.status === 201) {
        sessionStorage.setItem('user_type', 'company')
        console.log(sessionStorage.getItem('user_type'))
        sessionStorage.removeItem('reg_step1')
        sessionStorage.removeItem('employerProfile')
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

  const ReviewRow = ({ label, value }) => (
    <div className="review-row">
      <span>{label}</span>
      <span>{value || '—'}</span>
    </div>
  )

  const ReviewBlock = ({ label, value }) => (
    <div className="review-block">
      <span className="review-block-label">{label}</span>
      <p className="review-block-text">{value || '—'}</p>
    </div>
  )

  return (
    <div className="page">
      <Navbar />
      <div className="form-body">
        <div className="form-card">
          <h2 className="form-title">STEP 3: REVIEW</h2>
          <StepIndicator currentStep={3} labels={['Basic Info', 'Company Details', 'Review']} />

          <div className="review-body">

            <div className="review-section">
              <div className="review-section-header">
                <h3>Account</h3>
                <button className="edit-link" onClick={() => navigate('/register/company/step1')}>Edit</button>
              </div>
              <ReviewRow label="Name" value={step1.fullName} />
              <ReviewRow label="Email" value={step1.email} />
            </div>

            <div className="review-section">
              <div className="review-section-header">
                <h3>Company Overview</h3>
                <button className="edit-link" onClick={() => navigate('/register/company/step2')}>Edit</button>
              </div>
              <ReviewRow label="Company Name" value={profile.companyName} />
              <ReviewRow label="Company Email" value={profile.companyEmail} />
              <ReviewRow label="Short Description" value={profile.shortDescription} />
              <ReviewRow label="Industry" value={profile.industry} />
              <ReviewRow label="Founded Year" value={profile.foundedYear} />
              <ReviewRow label="Location" value={location} />
            </div>

            {profile.culture && (
              <div className="review-section">
                <div className="review-section-header">
                  <h3>Company Culture</h3>
                  <button className="edit-link" onClick={() => navigate('/register/company/step2')}>Edit</button>
                </div>
                <ReviewBlock value={profile.culture} />
              </div>
            )}

            {profile.bio && (
              <div className="review-section">
                <div className="review-section-header">
                  <h3>Company Bio</h3>
                  <button className="edit-link" onClick={() => navigate('/register/company/step2')}>Edit</button>
                </div>
                <ReviewBlock value={profile.bio} />
              </div>
            )}

            <p className="review-note">
              By creating an account you agree to our <a href="#" className="form-link">Terms of Service</a> and <a href="#" className="form-link">Privacy Policy</a>.
            </p>

            <button className="btn-primary btn-wide" onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="form-nav" style={{ marginTop: '12px' }}>
              <button className="btn-secondary" onClick={() => navigate('/register/company/step2')}>Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
