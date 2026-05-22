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

// ─── REUSABLE COMPONENTS ──────────────────────────────────────
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

function UpdateButton({ onClick, loading }) {
  return (
    <button className="btn-update" onClick={onClick} disabled={loading}>
      {loading ? 'Saving...' : 'Update'}
    </button>
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
          onChange={e => setInput(e.target.value)}
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

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function Resume({ FIELDS_OF_STUDY = [], WORK_MODES = [], EDUCATION_LEVELS = [], API_BASE_URL }) {
  const navigate = useNavigate()
  const [openSection, setOpenSection] = useState('education')
  const [saving, setSaving] = useState({})
  const [saved, setSaved] = useState({})

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

      const resumeResponse = await fetch(`${API_BASE_URL}/resume`, { method: 'POST',credentials: 'include' })
      if (resumeResponse.ok) {
        const data = await resumeResponse.json()
        const resumeData = data.resumes[0]
        const mappedResume = {
          resumeId:         resumeData.id,
          education:        resumeData.education,
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

  const flashSaved = (key) => {
    setSaved(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2000)
  }

  const handleUpdate = async (section, fields) => {
    setSaving(prev => ({ ...prev, [section]: true }))
    try {
      const res = await fetch(`${API_BASE_URL}/resume/${resume.resumeId}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) throw new Error('Save failed')
      flashSaved(section)
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(prev => ({ ...prev, [section]: false }))
    }
  }

  const handleReset = () => setResume(originalResume)

  const SaveIndicator = ({ field }) => saved[field]
    ? <span className="save-indicator">✓ Saved</span>
    : null

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

          {/* ── EDUCATION ── */}
          <Section title="Education" isOpen={openSection === 'education'} onToggle={() => toggleSection('education')}>

            <div className="update-row" style={{ overflow: 'visible' }}>
              <Field label="Education Level">
                <select className="field-select" value={resume.education} onChange={e => updateResume('education', parseInt(e.target.value))}>
                  {EDUCATION_LEVELS.map(l => (
                    <option key={l.value} value={l.value}>{l.value} — {l.label}</option>
                  ))}
                </select>
              </Field>
              <div className="update-col">
                <SaveIndicator field="education" />
                <UpdateButton loading={saving.education} onClick={() => handleUpdate('education', { education: resume.education })} />
              </div>
            </div>

            <div className="update-row" style={{ overflow: 'visible' }}>
              <Field label="Field of Study">
                <FieldSelect options={FIELDS_OF_STUDY} selected={resume.fieldOfStudy} onChange={val => updateResume('fieldOfStudy', val)} />
              </Field>
              <div className="update-col">
                <SaveIndicator field="fieldOfStudy" />
                <UpdateButton loading={saving.fieldOfStudy} onClick={() => handleUpdate('fieldOfStudy', { field_of_study: resume.fieldOfStudy })} />
              </div>
            </div>

          </Section>

          {/* ── EMPLOYMENT HISTORY ── */}
          <Section title="Employment History" isOpen={openSection === 'employment'} onToggle={() => toggleSection('employment')}>

            <div className="update-row">
              <Field label="Skills">
                <TagInput tags={resume.skills} onChange={val => updateResume('skills', val)} placeholder="Type a skill and press Enter..." />
              </Field>
              <div className="update-col">
                <SaveIndicator field="skills" />
                <UpdateButton loading={saving.skills} onClick={() => handleUpdate('skills', { skills: resume.skills })} />
              </div>
            </div>

            <div className="update-row">
              <Field label="Years of Experience">
                <input className="field-input" value={resume.expYears} onChange={e => updateResume('expYears', e.target.value)} placeholder="e.g. 3" type="number" min="0" max="60" style={{ maxWidth: '160px' }} />
              </Field>
              <div className="update-col">
                <SaveIndicator field="expYears" />
                <UpdateButton loading={saving.expYears} onClick={() => handleUpdate('expYears', { exp_years: parseInt(resume.expYears) })} />
              </div>
            </div>

            <div className="update-row">
              <Field label="Experience">
                <textarea className="field-textarea" rows={5} value={resume.experience} onChange={e => updateResume('experience', e.target.value)} placeholder="Describe your work experience..." />
              </Field>
              <div className="update-col">
                <SaveIndicator field="experience" />
                <UpdateButton loading={saving.experience} onClick={() => handleUpdate('experience', { experience: resume.experience })} />
              </div>
            </div>

          </Section>

          {/* ── OTHER ── */}
          <Section title="Other" isOpen={openSection === 'other'} onToggle={() => toggleSection('other')}>

            <div className="update-row">
              <Field label="Work Mode">
                <MultiCheckbox options={WORK_MODES} selected={resume.workModes} onChange={val => updateResume('workModes', val)} />
              </Field>
              <div className="update-col">
                <SaveIndicator field="workModes" />
                <UpdateButton loading={saving.workModes} onClick={() => handleUpdate('workModes', { work_mode: resume.workModes })} />
              </div>
            </div>

            <div className="update-row">
              <div style={{ flex: 1 }}>
                <Field label="Preferred Location">
                  <div className="field-row">
                    <input className="field-input" value={resume.preferredCity} onChange={e => updateResume('preferredCity', e.target.value)} placeholder="City" />
                    <input className="field-input" value={resume.preferredState} onChange={e => updateResume('preferredState', e.target.value)} placeholder="State" />
                    <input className="field-input" value={resume.preferredCountry} onChange={e => updateResume('preferredCountry', e.target.value)} placeholder="Country" />
                  </div>
                </Field>
              </div>
              <div className="update-col">
                <SaveIndicator field="preferredLocation" />
                <UpdateButton loading={saving.preferredLocation} onClick={() => handleUpdate('preferredLocation', { preferred_city: resume.preferredCity, preferred_state: resume.preferredState, preferred_country: resume.preferredCountry })} />
              </div>
            </div>

          </Section>

          {/* ── FOOTER BUTTONS ── */}
          <div className="resume-footer">
            <button className="btn-secondary" onClick={handleReset}>Reset</button>
            <button className="btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button className="btn-primary" onClick={() => handleUpdate('all', {
              education: resume.education, field_of_study: resume.fieldOfStudy,
              skills: resume.skills, exp_years: parseInt(resume.expYears),
              experience: resume.experience, work_mode: resume.workModes,
              preferred_city: resume.preferredCity, preferred_state: resume.preferredState,
              preferred_country: resume.preferredCountry,
            })}>
              {saving.all ? 'Saving...' : 'Save All'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
