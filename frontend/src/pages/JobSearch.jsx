import { useState, useEffect, useRef, use } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import DashNav from '../components/DashNav'

export default function JobSearch({ API_BASE_URL, EDUCATION_LEVELS = [], WORK_MODES = [], FIELDS_OF_STUDY = [] }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [city, setCity] = useState([])
  const [state, setState] = useState([])
  const [country, setCountry] = useState([])
  const [skill, setSkill] = useState([])
  const [filters, setFilters] = useState({
    work_mode: [],
    required_education: '',
    field_of_study: [],
    required_skills: [],
    exp_years: '',
    city: '',
    state: '',
    country: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    //Get all jobs for inital display
    doSearch()
    //Get initial filter params for location and skills
    fetchFilterOptions()
  }, [])

  //Query backend for locatiun and skill options for filters
  const fetchFilterOptions = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/search/filters`, {})
      if (response.ok) {
        const data = await response.json()
        setCity(data.locations.cities || [])
        setState(data.locations.states || [])
        setCountry(data.locations.countries || [])
        setSkill(data.skills || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const doSearch = async () => {
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (filters.work_mode.length) params.set('work_mode', filters.work_mode.join(','))
      if (filters.required_education) params.set('required_education', filters.required_education)
      if (filters.field_of_study.length) params.set('field_of_study', filters.field_of_study.join(','))
      if (filters.required_skills.length) params.set('required_skills', filters.required_skills.join(','))
      if (filters.exp_years) params.set('exp_years', filters.exp_years)
      if (filters.city) params.set('city', filters.city)
      if (filters.state) params.set('state', filters.state)
      if (filters.country) params.set('country', filters.country)

      //Job search endpoint
      const res = await apiFetch(`${API_BASE_URL}/search?${params}`, {})
      if (res.ok) {
        const data = await res.json()
        setResults(data.jobs || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') doSearch()
  }

  const clearFilters = () => {
    setFilters({ work_mode: [], required_education: '', field_of_study: [], required_skills: [], exp_years: '', city: '', state: '', country: '' })
  }

  const activeFilterCount = [
    filters.work_mode.length > 0,
    !!filters.required_education,
    !!filters.field_of_study.length,
    !!filters.required_skills.length,
    !!filters.exp_years,
    !!filters.city || !!filters.state || !!filters.country,
  ].filter(Boolean).length

  return (
    <div className="page">
      <DashNav activePage="search" userType="seeker" />

      <div className="search-page">
        <div className="search-header">
          <h1 className="search-title">Find Jobs</h1>
          <p className="search-sub">Search thousands of job postings by keyword, location, and more.</p>

          <div className="search-bar-row">
            <div className="search-bar">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="search-input"
                placeholder="Job title, skills, keywords…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
              />
              {query && (
                <button className="search-clear" onClick={() => setQuery('')}>✕</button>
              )}
            </div>
            <button className="btn-primary" onClick={doSearch}>Search</button>
          </div>

          <button
            className="filter-toggle"
            onClick={() => setShowFilters(f => !f)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filters {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
            <span style={{ marginLeft: 4 }}>{showFilters ? '▲' : '▼'}</span>
          </button>
        </div>

        <div className="search-layout">
          {/* Filters panel */}
          {showFilters && (
            <div className="filter-panel">
              <div className="filter-panel-header">
                <span className="filter-panel-title">Filters</span>
                <button className="filter-clear-btn" onClick={clearFilters}>Clear all</button>
              </div>

              <FilterSection title="Work Mode">
                {WORK_MODES.map(m => (
                  <label key={m} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={filters.work_mode.includes(m)}
                      onChange={() => {
                        const updated = filters.work_mode.includes(m)
                          ? filters.work_mode.filter(x => x !== m)
                          : [...filters.work_mode, m]
                        setFilters(f => ({ ...f, work_mode: updated }))
                      }}
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="Minimum Education">
                <select
                  className="field-select"
                  value={filters.required_education}
                  onChange={e => setFilters(f => ({ ...f, required_education: e.target.value }))}
                >
                  <option value="">Any</option>
                  {EDUCATION_LEVELS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </FilterSection>

              <MultiSelectDropdown
                options={FIELDS_OF_STUDY}
                selected={filters.field_of_study}
                onToggle={f => {
                  console.log("Toggling field of study:", f);
                  const updatedFields = filters.field_of_study.includes(f)
                    ? filters.field_of_study.filter(x => x !== f)
                    : [...filters.field_of_study, f];
                  console.log("Updated fields:", updatedFields);
                  setFilters(f => ({ ...f, field_of_study: updatedFields }));
                }}
                title="Field of Study"S
              />

              <MultiSelectDropdown
                options={skill}
                selected={filters.required_skills}
                onToggle={f => {
                  console.log("Toggling skills:", f);
                  const updatedskills = filters.required_skills.includes(f)
                    ? filters.required_skills.filter(x => x !== f)
                    : [...filters.required_skills, f];
                  console.log("Updated skills:", updatedskills);
                  setFilters(f => ({ ...f, required_skills: updatedskills }));
                }}
                title="Required Skills"
              />

              <FilterSection title="Min. Years of Experience">
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  max="30"
                  placeholder="e.g. 2"
                  value={filters.exp_years}
                  onChange={e => setFilters(f => ({ ...f, exp_years: e.target.value }))}
                />
              </FilterSection>

              <FilterSection title="Location">
                <select
                  className="field-select"
                  value={filters.city}
                  onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
                >
                  <option value="">Select City</option>
                  {city.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  className="field-select"
                  style={{ marginTop: 8 }}
                  value={filters.state}
                  onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}
                >
                  <option value="">Select State</option>
                  {state.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  className="field-select"
                  style={{ marginTop: 8 }}
                  value={filters.country}
                  onChange={e => setFilters(f => ({ ...f, country: e.target.value }))}
                >
                  <option value="">Select Country</option>
                  {country.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FilterSection>

              <button className="btn-primary btn-wide" style={{ marginTop: 8 }} onClick={doSearch}>
                Apply Filters
              </button>
            </div>
          )}

          {/* Results */}
          <div className="search-results">
            {loading ? (
              <div className="search-state">
                <div className="spinner" />
                <p>Searching…</p>
              </div>
            ) : !searched ? (
              <div className="search-state">
                <p className="search-hint">Enter a keyword or use filters to find jobs.</p>
              </div>
            ) : results.length === 0 ? (
              <div className="search-state">
                <p className="search-hint">No results found. Try different keywords or broaden your filters.</p>
              </div>
            ) : (
              <>
                <p className="results-count">{results.length} result{results.length !== 1 ? 's' : ''}</p>
                <div className="job-card-list">
                  {results.map(job => (
                    <div key={job.id} className="job-card" onClick={() => navigate(`/job/${job.id}`)}>
                      <div className="job-card-main">
                        <div className="job-card-title">{job.title}</div>
                        <div className="job-card-company">{job.company_name}</div>
                        <div className="job-card-meta">
                          {job.city && <span>📍 {job.city}{job.state ? `, ${job.state}` : ''}</span>}
                          {job.work_mode?.length > 0 && <span>🖥 {job.work_mode.join(' / ')}</span>}
                          {job.exp_years != null && <span>⏱ {job.exp_years}+ yrs</span>}
                        </div>
                        {job.summary && <p className="job-card-summary">{job.summary.slice(0, 160)}…</p>}
                        {job.required_skills?.length > 0 && (
                          <div className="tags-row" style={{ marginTop: 8 }}>
                            {job.required_skills.slice(0, 5).map(s => <span key={s} className="tag">{s}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSection({ title, children }) {
  return (
    <div className="filter-section">
      <p className="filter-section-title">{title}</p>
      {children}
    </div>
  )
}

function MultiSelectDropdown({ options, selected, onToggle, title }) {
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const triggerRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (open && triggerRef.current && wrapperRef.current) {
      const trigger = triggerRef.current
      // position absolutely relative to wrapper so it moves with scrolling
      setDropdownStyle({
        position: 'absolute',
        top: trigger.offsetTop + trigger.offsetHeight + 4,
        left: trigger.offsetLeft,
        width: trigger.offsetWidth,
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

  // close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (open && wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="filter-section" style={{ position: 'relative' }} ref={wrapperRef}>
      <p className="filter-section-title">{title}</p>

      <div ref={triggerRef}>
        <button
          type="button"
          className="field-select"
          onClick={() => setOpen(o => !o)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>{selected && selected.length ? `${selected.length} selected` : 'Select'}</span>
          <span style={{ marginLeft: 8 }}></span>
        </button>
      </div>

      {open && (
        <div style={dropdownStyle}>
          {(options || []).map(opt => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={selected?.includes(opt)} onChange={() => onToggle(opt)} />
              <span style={{ marginLeft: 8 }}>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}