import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function AccountType() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <Navbar />
      <div className="account-type-body">
        <h1 className="page-title">Create Your Account</h1>
        <p className="page-subtitle">Join the Intelligent Talent Matching Platform</p>

        <div className="account-cards">
          <button className="account-card" onClick={() => navigate('/register/seeker/step1')}>
            <div className="account-card-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" fill="currentColor" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <p className="account-card-sub">I am a</p>
            <h2 className="account-card-title">Job Seeker</h2>
            <p className="account-card-desc">Find jobs tailored to you</p>
          </button>

          <button className="account-card" onClick={() => navigate('/register/employer/step1')}>
            <div className="account-card-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="9" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M8 9V7a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <line x1="12" y1="13" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="10" y1="15" x2="14" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="account-card-sub">I am an</p>
            <h2 className="account-card-title">Employer</h2>
            <p className="account-card-desc">Find the best candidates</p>
          </button>
        </div>
        <p className="form-footer" style={{ marginTop: 32 }}>
          Already have an account?{' '}
          <span className="form-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>
            Log in
          </span>
        </p>
      </div>
    </div>
  )
}
