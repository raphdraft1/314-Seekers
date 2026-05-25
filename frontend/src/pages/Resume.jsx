import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashNav from '../components/DashNav'

const PLACEHOLDER_SEEKER = {
  seekerId: '00000',
  fullName: '',
  email:    '',
}

const PLACEHOLDER_RESUME = {
  education:        7,
  fieldOfStudy:     [],
  skills:           [],
  expYears:         '',
  experience:       '',
  workModes:        [],
  preferredCity:    '',
  preferredState:   '',
  preferredCountry: '',
}

function Section({ title, isOpen, onToggle, children }) {
  return (
    <div className={`resume-section ${isOpen ? 'open' : ''}`}>
      <button className="resume-section-header" onClick={onToggle}>
        <span>{title}</span>
        <span className={`accordion-arrow ${isOpen ? 'up' : ''}`}>▽</span>
      </button>
      {isOpen && <div className="resume-section-body">{children}</div>}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('')

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()])
      setInput('')
    }
  }

  return (
    <div className="tag-input-wrap">
      <div className="tag-input-box">
        {tags.map((t, i) => (
          <span key={i} className="tag">
            {t}
            <button className="tag-remove" onClick={() => onChange(tags.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
        <input
          className="tag-input-inner"
          placeholder={tags.length === 0 ? placeholder : ''}
          value={input}
          onChange={e => setInput(e.target.value.replace(/,/g, ''))}
          onKeyDown={addTag}
        />
      </div>
      <p className="field-hint">Press Enter to add</p>
    </div>
  )
}

function MultiCheckbox({ options, selected, onChange }) {
  const toggle = (opt) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])
  }
  return (
    <div className="checkbox-group">
      {options.map(opt => (
        <label key={opt} className="checkbox-option">
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  )
}

function FieldSelect({ options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])
  return (
    <div className="multiselect">
      <div className="multiselect-tags" onClick={() => setOpen(!open)}>
        {selected.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Select fields</span>}
        {selected.map(f => (
          <span key={f} className="tag">
            {f}
            <button className="tag-remove" onClick={e => { e.stopPropagation(); toggle(f) }}>×</button>
          </span>
        ))}
        <span className="multiselect-arrow">▼</span>
      </div>
      {open && (
        <div className="multiselect-dropdown">
          {options.map(f => (
            <label key={f} className="dropdown-option">
              <input type="checkbox" checked={selected.includes(f)} onChange={() => toggle(f)} />
              {f}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Resume({ FIELDS_OF_STUDY = [], WORK_MODES = [], EDUCATION_LEVELS = [], API_BASE_URL }) {
  const navigate = useNavigate()
  const [openSection, setOpenSection] = useState('education')
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  const [seeker, setSeeker] = useState(PLACEHOLDER_SEEKER)
  const [resume, setResume] = useState(PLACEHOLDER_RESUME)
  const [originalResume, setOriginalResume] = useState(PLACEHOLDER_RESUME)

  useEffect(() => {
    const fetchData = async () => {
      const seekerResponse = await fetch(`${API_BASE_URL}/getSeeker`, { method: 'POST', credentials: 'include' })
      if (seekerResponse.ok) {
        const data = await seekerResponse.json()
        const seekerData = data.seeker
        setSeeker({
          seekerId: seekerData.id,
          fullName: seekerData.full_name,
          email:    seekerData.email,
        })
      }

      const resumeResponse = await fetch(`${API_BASE_URL}/resume`, { method: 'POST', credentials: 'include' })
      if (resumeResponse.ok) {
        const data = await resumeResponse.json()
        const resumeData = data.resumes[0]
        const mappedResume = {
          resumeId:         resumeData.id,
          education:        parseInt(Object.keys(resumeData.education)[0]),
          fieldOfStudy:     resumeData.field_of_study || [],
          skills:           resumeData.skills || [],
          expYears:         resumeData.exp_years,
          experience:       resumeData.experience,
          workModes:        resumeData.work_mode || [],
          preferredCity:    resumeData.preferred_city,
          preferredState:   resumeData.preferred_state,
          preferredCountry: resumeData.preferred_country,
        }
        setResume(mappedResume)
        setOriginalResume(mappedResume)
      }
    }
    fetchData()
  }, [])

  const toggleSection = (id) => setOpenSection(prev => prev === id ? null : id)
  const updateResume = (key, val) => setResume(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async () => {
    setSaving(true)
    setApiError('')
    try {
      const res = await fetch(`${API_BASE_URL}/updateResume`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            education:        resume.education,
            field_of_study:   resume.fieldOfStudy,
            skills:           resume.skills,
            exp_years:        parseInt(resume.expYears) || 0,
            experience:       resume.experience,
            work_mode:        resume.workModes,
            preferred_city:   resume.preferredCity,
            preferred_state:  resume.preferredState,
            preferred_country: resume.preferredCountry,
          },
          resumeId: resume.resumeId,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setOriginalResume(resume)
      navigate('/dashboard')
    } catch {
      setApiError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => setResume(originalResume)

  return (
    <div className="page">
      <DashNav activePage="resume" userType="seeker" />

      <div className="resume-page">
        <div className="resume-card">
          <h1 className="resume-title">Resume</h1>
          <div className="resume-ids">
            <span>Resume ID: {resume.resumeId || '—'}</span>
            <span>Candidate ID: {seeker.seekerId || '—'}</span>
            <span>Name: {seeker.fullName || '—'}</span>
            <span>Email: {seeker.email || '—'}</span>
          </div>

          {apiError && <div className="api-error" style={{ marginBottom: 16 }}>{apiError}</div>}

          {/* ── EDUCATION ── */}
          <Section title="Education" isOpen={openSection === 'education'} onToggle={() => toggleSection('education')}>
            <Field label="Education Level">
              <select className="field-select" value={resume.education} onChange={e => updateResume('education', parseInt(e.target.value))}>
                {EDUCATION_LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.value} — {l.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Field of Study">
              <FieldSelect options={FIELDS_OF_STUDY} selected={resume.fieldOfStudy} onChange={val => updateResume('fieldOfStudy', val)} />
            </Field>
          </Section>

          {/* ── EMPLOYMENT HISTORY ── */}
          <Section title="Employment History" isOpen={openSection === 'employment'} onToggle={() => toggleSection('employment')}>
            <Field label="Skills">
              <TagInput tags={resume.skills} onChange={val => updateResume('skills', val)} placeholder="Type a skill and press Enter..." />
            </Field>
            <Field label="Years of Experience">
              <input className="field-input" value={resume.expYears} onChange={e => updateResume('expYears', e.target.value)} placeholder="e.g. 3" type="number" min="0" max="60" style={{ maxWidth: '160px' }} />
            </Field>
            <Field label="Experience">
              <textarea className="field-textarea" rows={5} value={resume.experience} onChange={e => updateResume('experience', e.target.value)} placeholder="Describe your work experience..." />
            </Field>
          </Section>

          {/* ── OTHER ── */}
          <Section title="Other" isOpen={openSection === 'other'} onToggle={() => toggleSection('other')}>
            <Field label="Work Mode">
              <MultiCheckbox options={WORK_MODES} selected={resume.workModes} onChange={val => updateResume('workModes', val)} />
            </Field>
            <Field label="Preferred Location">
              <div className="field-row">
                <input className="field-input" value={resume.preferredCity} onChange={e => updateResume('preferredCity', e.target.value)} placeholder="City" />
                <input className="field-input" value={resume.preferredState} onChange={e => updateResume('preferredState', e.target.value)} placeholder="State" />
                <input className="field-input" value={resume.preferredCountry} onChange={e => updateResume('preferredCountry', e.target.value)} placeholder="Country" />
              </div>
            </Field>
          </Section>

          {/* ── FOOTER ── */}
          <div className="resume-footer">
            <button className="btn-secondary" onClick={handleReset}>Reset</button>
            <button className="btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
