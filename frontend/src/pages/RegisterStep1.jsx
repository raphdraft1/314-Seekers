import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepIndicator from '../components/StepIndicator'

export default function RegisterStep1() {
  const navigate = useNavigate()
  const { role } = useParams()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null })
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    sessionStorage.setItem('reg_step1', JSON.stringify({ fullName: form.fullName, email: form.email, password: form.password }))
    navigate(`/register/${role}/step2`)
  }

  const EyeIcon = ({ visible }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {visible
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
      }
    </svg>
  )

  return (
    <div className="page">
      <Navbar />
      <div className="form-body">
        <div className="form-card">
          <h2 className="form-title">STEP 1: BASIC INFORMATION</h2>
          <StepIndicator currentStep={1} />

          <div className="form-fields">
            <div className="field-group">
              <label className="field-label">Full Name <span className="required">*</span></label>
              <input
                className={`field-input ${errors.fullName ? 'error' : ''}`}
                name="fullName"
                placeholder="Enter full name"
                value={form.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className="field-group">
              <label className="field-label">Email <span className="required">*</span></label>
              <input
                className={`field-input ${errors.email ? 'error' : ''}`}
                name="email"
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="field-group">
              <label className="field-label">Password <span className="required">*</span></label>
              <div className="password-wrap">
                <input
                  className={`field-input ${errors.password ? 'error' : ''}`}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button className="eye-btn" onClick={() => setShowPassword(!showPassword)} type="button">
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="field-group">
              <label className="field-label">Confirm password <span className="required">*</span></label>
              <div className="password-wrap">
                <input
                  className={`field-input ${errors.confirmPassword ? 'error' : ''}`}
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <button className="eye-btn" onClick={() => setShowConfirm(!showConfirm)} type="button">
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button className="btn-primary" onClick={handleSubmit}>Continue</button>

            <p className="form-footer">
              Already have an account? <a href="/login" className="form-link">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
