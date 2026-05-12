import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashNav from '../components/DashNav'

const EMPTY_FORM = {
  title: '',
  summary: '',
  responsibilities: '',
  required_education: 7,
  required_skills: [],
  exp_years: '',
  work_mode: [],
  field_of_study: [],
  city: '',
  state: '',
  country: '',
}

export default function JobPostingForm({ API_BASE_URL, EDUCATION_LEVELS = [], WORK_MODES = [], FIELDS_OF_STUDY = [] }) {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const isEditing = Boolean(jobId)

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditing)
  const [apiError, setApiError] = useState('')
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    if (!isEditing) return
    const fetchJob = async () => {
      try {
        // TODO: Backend needs GET /jobpostings/:id
        const res = await fetch(`${API_BASE_URL}/jobpostings/${jobId}`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          const j = data.jobposting
          setForm({
            title: j.title || '',
            summary: j.summary || '',
            responsibilities: j.responsibilities || '',
            required_education: j.required_education || 7,
            required_skills: j.required_skills || [],
            exp_years: j.exp_years ?? '',
            work_mode: j.work_mode || [],
            field_of_study: j.field_of_study || [],
            city: j.city || '',
            state: j.state || '',
            country: j.country || '',
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setFetchLoading(false)
      }
    }
    fetchJob()
  }, [jobId])

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Job title is required'
    if (!form.summary.trim()) e.summary = 'Summary is required'
    if (!form.responsibilities.trim()) e.responsibilities = 'Responsibilities are required'
    if (form.required_skills.length === 0) e.required_skills = 'Add at least one required skill'
    if (form.work_mode.length === 0) e.work_mode = 'Select at least one work mode'
    if (!form.country.trim()) e.country = 'Country is required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true)
    setApiError('')
    try {
      const payload = { ...form, exp_years: parseInt(form.exp_years) || 0 }

      let res
      if (isEditing) {
        // TODO: Backend needs PUT /jobpostings/:id
        res = await fetch(`${API_BASE_URL}/jobpostings/${jobId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        // TODO: Backend needs POST /jobpostings
        res = await fetch(`${API_BASE_URL}/jobpostings`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        navigate('/jobs')
      } else {
        const data = await res.json()
        setApiError(data.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setApiError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return
    try {
      // TODO: Backend needs DELETE /jobpostings/:id
      const res = await fetch(`${API_BASE_URL}/jobpostings/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) navigate('/jobs')
    } catch (err) {
      console.error(err)
    }
  }

  const addSkill = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault()
      const s = skillInput.trim()
      if (!form.required_skills.includes(s)) update('required_skills', [...form.required_skills, s])
      setSkillInput('')
    }
  }

  const removeSkill = (s) => update('required_skills', form.required_skills.filter(x => x !== s))

  const toggleMode = (m) => {
    update('work_mode', form.work_mode.includes(m) ? form.work_mode.filter(x => x !== m) : [...form.work_mode, m])
  }

  const toggleField = (f) => {
    update('field_of_study', form.field_of_study.includes(f) ? form.field_of_study.filter(x => x !== f) : [...form.field_of_study, f])
  }

  if (fetchLoading) return (
    <div className="page">
      <DashNav activePage="home" userType="employer" />
      <div className="dash-page"><div className="dash-empty">Loading job posting…</div></div>
    </div>
  )

  return (
    <div className="page">
      <DashNav activePage="home" userType="employer" />

      <div className="form-body" style={{ paddingTop: 40 }}>
        <div className="form-card" style={{ maxWidth: 700 }}>
          <h2 className="form-title">{isEditing ? 'Edit Job Posting' : 'Create Job Posting'}</h2>

          {apiError && <div className="api-error" style={{ marginBottom: 20 }}>{apiError}</div>}

          <div className="form-fields">

            {/* Job Title */}
            <div className="field-group">
              <label className="field-label">Job Title <span className="required">*</span></label>
              <input className={`field-input ${errors.title ? 'error' : ''}`} placeholder="e.g. Senior Software Engineer" value={form.title} onChange={e => update('title', e.target.value)} />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            {/* Summary */}
            <div className="field-group">
              <label className="field-label">Job Summary <span className="required">*</span></label>
              <textarea className={`field-textarea ${errors.summary ? 'error' : ''}`} rows={4} placeholder="Brief overview of the role and what you're looking for…" value={form.summary} onChange={e => update('summary', e.target.value)} />
              {errors.summary && <span className="field-error">{errors.summary}</span>}
            </div>

            {/* Responsibilities */}
            <div className="field-group">
              <label className="field-label">Responsibilities <span className="required">*</span></label>
              <textarea className={`field-textarea ${errors.responsibilities ? 'error' : ''}`} rows={5} placeholder="Key duties and responsibilities of the role…" value={form.responsibilities} onChange={e => update('responsibilities', e.target.value)} />
              {errors.responsibilities && <span className="field-error">{errors.responsibilities}</span>}
            </div>

            {/* Skills */}
            <div className="field-group">
              <label className="field-label">Required Skills <span className="required">*</span></label>
              <div className="tag-input-box">
                {form.required_skills.map(s => (
                  <span key={s} className="tag">{s}<button className="tag-remove" onClick={() => removeSkill(s)}>×</button></span>
                ))}
                <input className="tag-input-inner" placeholder={form.required_skills.length === 0 ? 'Type a skill and press Enter…' : ''} value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} />
              </div>
              <p className="field-hint">Press Enter to add a skill</p>
              {errors.required_skills && <span className="field-error">{errors.required_skills}</span>}
            </div>

            <div className="field-row">
              {/* Education */}
              <div className="field-group">
                <label className="field-label">Required Education</label>
                <select className="field-select" value={form.required_education} onChange={e => update('required_education', parseInt(e.target.value))}>
                  {EDUCATION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.value} — {l.label}</option>)}
                </select>
              </div>

              {/* Exp years */}
              <div className="field-group">
                <label className="field-label">Years of Experience</label>
                <input className="field-input" type="number" min="0" max="30" placeholder="e.g. 3" value={form.exp_years} onChange={e => update('exp_years', e.target.value)} />
              </div>
            </div>

            {/* Work Mode */}
            <div className="field-group">
              <label className="field-label">Work Mode <span className="required">*</span></label>
              <div className="checkbox-group" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {WORK_MODES.map(m => (
                  <label key={m} className="checkbox-option" style={{ flex: '0 0 auto' }}>
                    <input type="checkbox" checked={form.work_mode.includes(m)} onChange={() => toggleMode(m)} />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
              {errors.work_mode && <span className="field-error">{errors.work_mode}</span>}
            </div>

            {/* Field of Study */}
            {FIELDS_OF_STUDY.length > 0 && (
              <div className="field-group">
                <label className="field-label">Relevant Fields of Study</label>
                <div className="multiselect">
                  <div className="multiselect-tags" onClick={e => e.currentTarget.nextSibling.classList.toggle('hidden')}>
                    {form.field_of_study.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Select fields (optional)</span>}
                    {form.field_of_study.map(f => (
                      <span key={f} className="tag">{f}<button className="tag-remove" onClick={e => { e.stopPropagation(); toggleField(f) }}>×</button></span>
                    ))}
                    <span className="multiselect-arrow">▼</span>
                  </div>
                  <div className="multiselect-dropdown hidden">
                    {FIELDS_OF_STUDY.map(f => (
                      <label key={f} className="dropdown-option">
                        <input type="checkbox" checked={form.field_of_study.includes(f)} onChange={() => toggleField(f)} />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="field-group">
              <label className="field-label">Location <span className="required">*</span></label>
              <div className="field-row">
                <input className="field-input" placeholder="City" value={form.city} onChange={e => update('city', e.target.value)} />
                <input className="field-input" placeholder="State" value={form.state} onChange={e => update('state', e.target.value)} />
                <input className={`field-input ${errors.country ? 'error' : ''}`} placeholder="Country" value={form.country} onChange={e => update('country', e.target.value)} />
              </div>
              {errors.country && <span className="field-error">{errors.country}</span>}
            </div>

            <div className="form-nav">
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" onClick={() => navigate('/jobs')}>Cancel</button>
                {isEditing && (
                  <button className="btn-secondary" style={{ color: 'var(--danger)', borderColor: '#fecaca' }} onClick={handleDelete}>
                    Delete
                  </button>
                )}
              </div>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving…' : isEditing ? 'Save Changes' : 'Post Job'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
