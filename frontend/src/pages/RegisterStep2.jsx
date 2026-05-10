import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepIndicator from '../components/StepIndicator'

const SECTIONS = [
  { id: 'personal', label: '1. Personal Information' },
  { id: 'education', label: '2. Education' },
  { id: 'experience', label: '3. Experience' },
  { id: 'skills', label: '4. Skills' },
  { id: 'preferences', label: '5. Preferences' },
]

function AccordionSection({ label, isOpen, onToggle, children }) {
  return (
    <div className={`accordion ${isOpen ? 'open' : ''}`} style={{ overflow: isOpen ? 'visible' : 'hidden' }}>
      <button className="accordion-header" onClick={onToggle}>
        <span>{label}</span>
        <span className={`accordion-arrow ${isOpen ? 'up' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="accordion-body">{children}</div>}
    </div>
  )
}


const EDU_LEVELS = [
  '1 - No Formal Education', '2 - Primary School', '3 - Middle School',
  '4 - High School', '5 - Vocational / Certificate', '6 - Associate Degree',
  '7 - Bachelor', '8 - Honours', '9 - Master', '10 - Doctorate / PhD',
]

function MultiSelectDropdown({ options, selected, onToggle }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="multiselect">
      <div className="multiselect-tags" onClick={() => setOpen(!open)}>
        {selected.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Select options</span>}
        {selected.map(f => (
          <span key={f} className="tag">
            {f}
            <button className="tag-remove" onClick={e => { e.stopPropagation(); onToggle(f) }}>×</button>
          </span>
        ))}
        <span className="multiselect-arrow">▼</span>
      </div>
      {open && (
        <div className="multiselect-dropdown">
          {options.map(f => (
            <label key={f} className="dropdown-option">
              <input
                type="checkbox"
                checked={selected.includes(f)}
                onChange={() => onToggle(f)}
              />
              {f}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

function EducationSection({ FIELDS_OF_STUDY = [] }) {
  const [eduLevel, setEduLevel] = useState('7 - Bachelor')
  const [selectedFields, setSelectedFields] = useState([])

  const toggleField = (field) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    )
  }

  return (
    <div className="section-content">
      <div className="field-group">
        <label className="field-label">
          Education Level (1-10) <span className="required">*</span>
          <span className="info-icon" title="Scale of 1–10 based on highest qualification">ⓘ</span>
        </label>
        <select className="field-select" value={eduLevel} onChange={e => setEduLevel(e.target.value)}>
          {EDU_LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      <div className="field-group">
        <label className="field-label">
          Field of Study <span className="field-note">(Select one or more)</span> <span className="required">*</span>
          <span className="info-icon" title="Select your area(s) of study">ⓘ</span>
        </label>
        <MultiSelectDropdown
          options={FIELDS_OF_STUDY}
          selected={selectedFields}
          onToggle={toggleField}
        />
      </div>
    </div>
  )
}

function PersonalSection() {
  return (
    <div className="section-content">
      <div className="field-row">
        <div className="field-group">
          <label className="field-label">Phone Number</label>
          <input className="field-input" placeholder="+61 400 000 000" />
        </div>
        <div className="field-group">
          <label className="field-label">Location</label>
          <input className="field-input" placeholder="City, Country" />
        </div>
      </div>
      <div className="field-group">
        <label className="field-label">LinkedIn Profile</label>
        <input className="field-input" placeholder="https://linkedin.com/in/yourname" />
      </div>
      <div className="field-group">
        <label className="field-label">Portfolio / Website</label>
        <input className="field-input" placeholder="https://yourwebsite.com" />
      </div>
    </div>
  )
}

function ExperienceSection() {
  return (
    <div className="section-content">
      <div className="field-group">
        <label className="field-label">Years of Experience</label>
        <select className="field-select">
          <option>Less than 1 year</option>
          <option>1–2 years</option>
          <option>3–5 years</option>
          <option>5–10 years</option>
          <option>10+ years</option>
        </select>
      </div>
      <div className="field-group">
        <label className="field-label">Most Recent Job Title</label>
        <input className="field-input" placeholder="e.g. Software Engineer" />
      </div>
      <div className="field-group">
        <label className="field-label">Most Recent Employer</label>
        <input className="field-input" placeholder="e.g. Acme Corp" />
      </div>
    </div>
  )
}

function SkillsSection() {
  const [skills, setSkills] = useState([])
  const [input, setInput] = useState('')

  const addSkill = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      setSkills([...skills, input.trim()])
      setInput('')
    }
  }

  return (
    <div className="section-content">
      <div className="field-group">
        <label className="field-label">Skills <span className="field-note">(Press Enter to add)</span></label>
        <input
          className="field-input"
          placeholder="e.g. Python, Project Management..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={addSkill}
        />
        <div className="tags-row">
          {skills.map((s, i) => (
            <span key={i} className="tag">
              {s}
              <button className="tag-remove" onClick={() => setSkills(skills.filter((_, j) => j !== i))}>×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function PreferencesSection({ WORK_MODES = [] }) {
  const [workModes, setWorkModes] = useState([])

  const toggleMode = (mode) => {
    setWorkModes(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    )
  }

  return (
    <div className="section-content">
      <div className="field-group">
        <label className="field-label">Preferred Work Type</label>
        <select className="field-select">
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
          <option>Internship</option>
          <option>Freelance</option>
        </select>
      </div>

      <div className="field-group">
        <label className="field-label">
          Work Mode <span className="field-note">(Select all that apply)</span>
        </label>
        <div className="checkbox-group">
          {WORK_MODES.map(mode => (
            <label key={mode} className="checkbox-option">
              <input
                type="checkbox"
                checked={workModes.includes(mode)}
                onChange={() => toggleMode(mode)}
              />
              <span>{mode}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Expected Salary (Annual)</label>
        <input className="field-input" placeholder="e.g. $70,000" />
      </div>
    </div>
  )
}

export default function RegisterStep2({ FIELDS_OF_STUDY = [], WORK_MODES = [], EDUCATION_LEVELS = [] } = {}) {
  const navigate = useNavigate()
  const { role } = useParams()
  const [openSection, setOpenSection] = useState(null)

  const toggleSection = (id) => setOpenSection(prev => prev === id ? null : id)

  return (
    <div className="page">
      <Navbar />
      <div className="form-body">
        <div className="form-card">
          <h2 className="form-title">STEP 2: RESUME / PROFILE DETAILS</h2>
          <StepIndicator currentStep={2} />

          <div className="accordion-list">
            {SECTIONS.map(s => (
              <AccordionSection
                key={s.id}
                label={s.label}
                isOpen={openSection === s.id}
                onToggle={() => toggleSection(s.id)}
              >
                {s.id === 'personal' && <PersonalSection />}
                {s.id === 'education' && <EducationSection FIELDS_OF_STUDY={FIELDS_OF_STUDY} />}
                {s.id === 'experience' && <ExperienceSection />}
                {s.id === 'skills' && <SkillsSection />}
                {s.id === 'preferences' && <PreferencesSection WORK_MODES={WORK_MODES} />}
              </AccordionSection>
            ))}
          </div>

          <div className="form-nav">
            <button className="btn-secondary" onClick={() => navigate(`/register/${role}/step1`)}>Back</button>
            <button className="btn-primary" onClick={() => navigate(`/register/${role}/step3`)}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  )
}
