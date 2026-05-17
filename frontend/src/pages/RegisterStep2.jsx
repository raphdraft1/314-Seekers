import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepIndicator from '../components/StepIndicator'

const SECTIONS = [
  { id: 'personal',    label: '1. Personal Information' },
  { id: 'education',   label: '2. Education' },
  { id: 'experience',  label: '3. Experience' },
  { id: 'skills',      label: '4. Skills' },
  { id: 'preferences', label: '5. Preferences' },
]

function AccordionSection({ label, isOpen, onToggle, children }) {
  return (
    <div className={`accordion ${isOpen ? 'open' : ''}`} style={{ overflow: 'visible' }}>
      <button className="accordion-header" onClick={onToggle}>
        <span>{label}</span>
        <span className={`accordion-arrow ${isOpen ? 'up' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="accordion-body" style={{ overflow: 'visible' }}>{children}</div>}
    </div>
  )
}

function MultiSelectDropdown({ options, selected, onToggle }) {
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const triggerRef = useRef(null)

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        background: '#fff',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        maxHeight: '210px',
        overflowY: 'auto',
        padding: '6px 0',
      })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={triggerRef} className="multiselect" style={{ position: 'relative' }}>
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
      {open && createPortal(
        <div style={dropdownStyle}>
          {options.map(f => (
            <label key={f} className="dropdown-option">
              <input type="checkbox" checked={selected.includes(f)} onChange={() => onToggle(f)} />
              {f}
            </label>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

function PersonalSection({ data, onChange }) {
  return (
    <div className="section-content">
      <div className="field-group">
        <label className="field-label">Age</label>
        <input
          className="field-input"
          type="number" min="16" max="100"
          placeholder="e.g. 25"
          value={data.age}
          onChange={e => onChange('age', e.target.value)}
          style={{ maxWidth: '160px' }}
        />
      </div>
      <div className="field-row">
        <div className="field-group">
          <label className="field-label">City</label>
          <input className="field-input" placeholder="e.g. Sydney" value={data.city} onChange={e => onChange('city', e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">State</label>
          <input className="field-input" placeholder="e.g. NSW" value={data.state} onChange={e => onChange('state', e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">Country</label>
          <input className="field-input" placeholder="e.g. Australia" value={data.country} onChange={e => onChange('country', e.target.value)} />
        </div>
      </div>
      <div className="field-group">
        <label className="field-label">Short Description <span className="field-note">(one-liner tagline)</span></label>
        <input className="field-input" placeholder="e.g. Full-stack developer with 3 years experience" value={data.shortDesc} onChange={e => onChange('shortDesc', e.target.value)} />
      </div>
      <div className="field-group">
        <label className="field-label">Bio <span className="field-note">(optional)</span></label>
        <textarea className="field-textarea" rows={3} placeholder="Tell employers about yourself..." value={data.bio} onChange={e => onChange('bio', e.target.value)} />
      </div>
    </div>
  )
}

function EducationSection({ data, onChange, FIELDS_OF_STUDY, EDUCATION_LEVELS }) {
  return (
    <div className="section-content">
      <div className="field-group">
        <label className="field-label">
          Education Level <span className="required">*</span>
        </label>
        <select className="field-select" value={data.eduLevel} onChange={e => onChange('eduLevel', parseInt(e.target.value))}>
          {EDUCATION_LEVELS.map(l => (
            <option key={l.value} value={l.value}>{l.value} — {l.label}</option>
          ))}
        </select>
      </div>
      <div className="field-group">
        <label className="field-label">
          Field of Study <span className="field-note">(Select one or more)</span>
        </label>
        <MultiSelectDropdown
          options={FIELDS_OF_STUDY}
          selected={data.fieldOfStudy}
          onToggle={f => {
            console.log("Toggling field of study:", f);
            const updatedFieldOfStudy = data.fieldOfStudy.includes(f)
              ? data.fieldOfStudy.filter(x => x !== f)
              : [...data.fieldOfStudy, f];
            console.log("Updated fieldOfStudy:", updatedFieldOfStudy);
            onChange('fieldOfStudy', updatedFieldOfStudy);
          }}
        />
      </div>
    </div>
  )
}

function ExperienceSection({ data, onChange }) {
  return (
    <div className="section-content">
      <div className="field-group">
        <label className="field-label">Years of Experience</label>
        <input
          className="field-input"
          type="number" min="0" max="60"
          placeholder="e.g. 3"
          value={data.expYears}
          onChange={e => onChange('expYears', e.target.value)}
          style={{ maxWidth: '160px' }}
        />
      </div>
      <div className="field-group">
        <label className="field-label">Experience Summary <span className="field-note">(optional)</span></label>
        <textarea className="field-textarea" rows={4} placeholder="Describe your work experience..." value={data.experience} onChange={e => onChange('experience', e.target.value)} />
      </div>
    </div>
  )
}

function SkillsSection({ data, onChange }) {
  const [input, setInput] = useState('')

  const addSkill = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      if (!data.skills.includes(input.trim())) onChange('skills', [...data.skills, input.trim()])
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
          {data.skills.map((s, i) => (
            <span key={i} className="tag">
              {s}
              <button className="tag-remove" onClick={() => onChange('skills', data.skills.filter((_, j) => j !== i))}>×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function PreferencesSection({ data, onChange, WORK_MODES }) {
  return (
    <div className="section-content">
      <div className="field-group">
        <label className="field-label">Work Mode <span className="field-note">(Select all that apply)</span></label>
        <div className="checkbox-group">
          {WORK_MODES.map(mode => (
            <label key={mode} className="checkbox-option">
              <input
                type="checkbox"
                checked={data.workModes.includes(mode)}
                onChange={() => onChange('workModes', data.workModes.includes(mode)
                  ? data.workModes.filter(m => m !== mode)
                  : [...data.workModes, mode]
                )}
              />
              <span>{mode}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="field-row">
        <div className="field-group">
          <label className="field-label">Preferred City</label>
          <input className="field-input" placeholder="e.g. Sydney" value={data.preferredCity} onChange={e => onChange('preferredCity', e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">Preferred State</label>
          <input className="field-input" placeholder="e.g. NSW" value={data.preferredState} onChange={e => onChange('preferredState', e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">Preferred Country</label>
          <input className="field-input" placeholder="e.g. Australia" value={data.preferredCountry} onChange={e => onChange('preferredCountry', e.target.value)} />
        </div>
      </div>
    </div>
  )
}

export default function RegisterStep2({ FIELDS_OF_STUDY = [], WORK_MODES = [], EDUCATION_LEVELS = [] } = {}) {
  const navigate = useNavigate()
  const { role } = useParams()
  const [openSection, setOpenSection] = useState(null)

  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('reg_step2')
    return saved ? JSON.parse(saved) : {
      age: '', city: '', state: '', country: '', shortDesc: '', bio: '',
      eduLevel: EDUCATION_LEVELS[0]?.value || 7, fieldOfStudy: [],
      expYears: '', experience: '',
      skills: [],
      workModes: [], preferredCity: '', preferredState: '', preferredCountry: '',
    }
  })

  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }))
  const toggleSection = (id) => setOpenSection(prev => prev === id ? null : id)

  const handleContinue = () => {
    sessionStorage.setItem('reg_step2', JSON.stringify(formData))
    navigate(`/register/${role}/step3`)
  }

  return (
    <div className="page">
      <Navbar />
      <div className="form-body">
        <div className="form-card">
          <h2 className="form-title">STEP 2: RESUME / PROFILE DETAILS</h2>
          <StepIndicator currentStep={2} />

          <div className="accordion-list">
            {SECTIONS.map(s => (
              <AccordionSection key={s.id} label={s.label} isOpen={openSection === s.id} onToggle={() => toggleSection(s.id)}>
                {s.id === 'personal'    && <PersonalSection    data={formData} onChange={update} />}
                {s.id === 'education'   && <EducationSection   data={formData} onChange={update} FIELDS_OF_STUDY={FIELDS_OF_STUDY} EDUCATION_LEVELS={EDUCATION_LEVELS} />}
                {s.id === 'experience'  && <ExperienceSection  data={formData} onChange={update} />}
                {s.id === 'skills'      && <SkillsSection      data={formData} onChange={update} />}
                {s.id === 'preferences' && <PreferencesSection data={formData} onChange={update} WORK_MODES={WORK_MODES} />}
              </AccordionSection>
            ))}
          </div>

          <div className="form-nav">
            <button className="btn-secondary" onClick={() => navigate(`/register/${role}/step1`)}>Back</button>
            <button className="btn-primary" onClick={handleContinue}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  )
}
