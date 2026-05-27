import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepIndicator from '../components/StepIndicator'

const COUNTRIES = [
  'Australia', 'United States', 'United Kingdom', 'Canada', 'New Zealand',
  'Singapore', 'India', 'Germany', 'France', 'Japan', 'China', 'Brazil',
  'South Korea', 'Netherlands', 'Sweden', 'Switzerland', 'Other'
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 150 }, (_, i) => currentYear - i)

// Store form data in sessionStorage so review page can read it
const saveToSession = (data) => sessionStorage.setItem('employerProfile', JSON.stringify(data))

export default function EmployerStep2() {
  const navigate = useNavigate()

  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem('employerProfile')
    return saved ? JSON.parse(saved) : {
      shortDescription: '',
      industry: '', foundedYear: '', city: '', state: '',
      country: '', culture: '', bio: '',
    }
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.shortDescription.trim()) e.shortDescription = 'Short description is required'
    if (!form.industry.trim()) e.industry = 'Industry is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state.trim()) e.state = 'State is required'
    if (!form.country) e.country = 'Country is required'
    return e
  }

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value }
    setForm(updated)
    saveToSession(updated)
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null })
  }

  const handleContinue = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    saveToSession(form)
    navigate('/register/company/step3')
  }

  return (
    <div className="page">
      <Navbar />
      <div className="form-body">
        <div className="form-card">
          <h2 className="form-title">STEP 2: COMPANY PROFILE</h2>
          <StepIndicator currentStep={2} labels={['Basic Info', 'Company Details', 'Review']} />

          <div className="form-fields">

            {/* Short Description */}
            <div className="field-group">
              <label className="field-label">
                Short Description <span className="required">*</span>
                <span className="field-note"> (one line summary)</span>
              </label>
              <input className={`field-input ${errors.shortDescription ? 'error' : ''}`} name="shortDescription" placeholder="e.g. Autonomous Robotics & Vision Company" value={form.shortDescription} onChange={handleChange} />
              {errors.shortDescription && <span className="field-error">{errors.shortDescription}</span>}
            </div>

            {/* Industry */}
            <div className="field-group">
              <label className="field-label">Industry <span className="required">*</span></label>
              <input className={`field-input ${errors.industry ? 'error' : ''}`} name="industry" placeholder="e.g. Robotics / Industrial Automation / Computer Vision" value={form.industry} onChange={handleChange} />
              {errors.industry && <span className="field-error">{errors.industry}</span>}
            </div>

            {/* Founded Year */}
            <div className="field-group">
              <label className="field-label">Founded Year</label>
              <select className="field-select" name="foundedYear" value={form.foundedYear} onChange={handleChange}>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* City + State */}
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">City <span className="required">*</span></label>
                <input className={`field-input ${errors.city ? 'error' : ''}`} name="city" placeholder="Enter city" value={form.city} onChange={handleChange} />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>
              <div className="field-group">
                <label className="field-label">State <span className="required">*</span></label>
                <input className={`field-input ${errors.state ? 'error' : ''}`} name="state" placeholder="Enter state" value={form.state} onChange={handleChange} />
                {errors.state && <span className="field-error">{errors.state}</span>}
              </div>
            </div>

            {/* Country */}
            <div className="field-group">
              <label className="field-label">Country <span className="required">*</span></label>
              <input className={`field-input ${errors.country ? 'error' : ''}`} name="country" placeholder="Enter country" value={form.country} onChange={handleChange} />
              {errors.country && <span className="field-error">{errors.country}</span>}
            </div>

            {/* Culture */}
            <div className="field-group">
              <label className="field-label">
                Company Culture
                <span className="field-note"> (optional)</span>
              </label>
              <textarea className="field-textarea" name="culture" rows={3} placeholder="e.g. Flat hierarchy, fast-paced, strong bias toward shipping..." value={form.culture} onChange={handleChange} />
            </div>

            {/* Bio */}
            <div className="field-group">
              <label className="field-label">
                Company Bio
                <span className="field-note"> (optional)</span>
              </label>
              <textarea className="field-textarea" name="bio" rows={5} placeholder="Tell candidates about your company, what you build, and what makes you unique..." value={form.bio} onChange={handleChange} />
            </div>

          </div>

          <div className="form-nav">
            <button className="btn-secondary" onClick={() => navigate('/register/company/step1')}>Back</button>
            <button className="btn-primary" onClick={handleContinue}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  )
}
