import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepIndicator from '../components/StepIndicator'

export default function EmployerStep3() {
  const navigate = useNavigate()

  // Read data saved by Step 2
  const profile = JSON.parse(sessionStorage.getItem('employerProfile') || '{}')
  const step1Email = sessionStorage.getItem('employerEmail') || '—'

  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || '—'

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

            {/* Company Overview */}
            <div className="review-section">
              <div className="review-section-header">
                <h3>Company Overview</h3>
                <button className="edit-link" onClick={() => navigate('/register/employer/step2')}>Edit</button>
              </div>
              <ReviewRow label="Company Name" value={profile.companyName} />
              <ReviewRow label="Company Email" value={profile.companyEmail} />
              <ReviewRow label="Short Description" value={profile.shortDescription} />
              <ReviewRow label="Industry" value={profile.industry} />
              <ReviewRow label="Founded Year" value={profile.foundedYear} />
              <ReviewRow label="Location" value={location} />
            </div>

            {/* Culture */}
            {profile.culture && (
              <div className="review-section">
                <div className="review-section-header">
                  <h3>Company Culture</h3>
                  <button className="edit-link" onClick={() => navigate('/register/employer/step2')}>Edit</button>
                </div>
                <ReviewBlock value={profile.culture} />
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="review-section">
                <div className="review-section-header">
                  <h3>Company Bio</h3>
                  <button className="edit-link" onClick={() => navigate('/register/employer/step2')}>Edit</button>
                </div>
                <ReviewBlock value={profile.bio} />
              </div>
            )}

            <p className="review-note">
              By creating an account you agree to our <a href="#" className="form-link">Terms of Service</a> and <a href="#" className="form-link">Privacy Policy</a>.
            </p>

            <button className="btn-primary btn-wide" onClick={() => alert('Employer account created! (hook up to backend)')}>
              Create Account
            </button>

            <div className="form-nav" style={{ marginTop: '12px' }}>
              <button className="btn-secondary" onClick={() => navigate('/register/employer/step2')}>Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
