import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepIndicator from '../components/StepIndicator'

export default function RegisterStep3() {
  const navigate = useNavigate()
  const { role } = useParams()

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

            <button className="btn-primary btn-wide" onClick={() => alert('Account created! (hook up to backend)')}>
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
