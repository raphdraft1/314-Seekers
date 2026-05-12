import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashNav from '../components/DashNav'

export default function CandidateSearch({ API_BASE_URL, EDUCATION_LEVELS = [], WORK_MODES = [] }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    work_mode: [],
    education: '',
    exp_years: '',
    preferred_city: '',
    preferred_state: '',
    preferred_country: '',
  })

  const doSearch = async () => {
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (filters.work_mode.length) params.set('work_mode', filters.work_mode.join(','))
      if (filters.education) params.set('education', filters.education)
      if (filters.exp_years) params.set('exp_years', filters.exp_years)
      if (filters.preferred_city) params.set('preferred_city', filters.preferred_city)
      if (filters.preferred_state) params.set('preferred_state', filters.preferred_state)
      if (filters.preferred_country) params.set('preferred_country', filters.preferred_country)

      // TODO: Backend needs GET /search/candidates?q=...&work_mode=...&etc
      const res = await fetch(`${API_BASE_URL}/search/candidates?${params}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setResults(data.resumes || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () =>
    setFilters({ work_mode: [], education: '', exp_years: '', preferred_city: '', preferred_state: '', preferred_country: '' })

  const activeFilterCount = [
    filters.work_mode.length > 0,
    !!filters.education,
    !!filters.exp_years,
    !!filters.preferred_city || !!filters.preferred_state || !!filters.preferred_country,
  ].filter(Boolean).length

  return (
    <div className="page">
      <DashNav activePage="search" userType="employer" />

      <div className="search-page">
        <div className="search-header">
          <h1 className="search-title">Find Candidates</h1>
          <p className="search-sub">Search candidate profiles by skills, experience, and location.</p>

          <div className="search-bar-row">
            <div className="search-bar">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="search-input"
                placeholder="Skills, experience, keywords…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
              />
              {query && <button className="search-clear" onClick={() => setQuery('')}>✕</button>}
            </div>
            <button className="btn-primary" onClick={doSearch}>Search</button>
          </div>

          <button className="filter-toggle" onClick={() => setShowFilters(f => !f)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filters {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
            <span style={{ marginLeft: 4 }}>{showFilters ? '▲' : '▼'}</span>
          </button>
        </div>

        <div className="search-layout">
          {showFilters && (
            <div className="filter-panel">
              <div className="filter-panel-header">
                <span className="filter-panel-title">Filters</span>
                <button className="filter-clear-btn" onClick={clearFilters}>Clear all</button>
              </div>

              <div className="filter-section">
                <p className="filter-section-title">Work Mode</p>
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
              </div>

              <div className="filter-section">
                <p className="filter-section-title">Minimum Education</p>
                <select className="field-select" value={filters.education} onChange={e => setFilters(f => ({ ...f, education: e.target.value }))}>
                  <option value="">Any</option>
                  {EDUCATION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              <div className="filter-section">
                <p className="filter-section-title">Min. Years of Experience</p>
                <input className="field-input" type="number" min="0" max="30" placeholder="e.g. 2" value={filters.exp_years} onChange={e => setFilters(f => ({ ...f, exp_years: e.target.value }))} />
              </div>

              <div className="filter-section">
                <p className="filter-section-title">Preferred Location</p>
                <input className="field-input" placeholder="City" value={filters.preferred_city} onChange={e => setFilters(f => ({ ...f, preferred_city: e.target.value }))} />
                <input className="field-input" style={{ marginTop: 8 }} placeholder="State" value={filters.preferred_state} onChange={e => setFilters(f => ({ ...f, preferred_state: e.target.value }))} />
                <input className="field-input" style={{ marginTop: 8 }} placeholder="Country" value={filters.preferred_country} onChange={e => setFilters(f => ({ ...f, preferred_country: e.target.value }))} />
              </div>

              <button className="btn-primary btn-wide" style={{ marginTop: 8 }} onClick={doSearch}>Apply Filters</button>
            </div>
          )}

          <div className="search-results">
            {loading ? (
              <div className="search-state"><div className="spinner" /><p>Searching…</p></div>
            ) : !searched ? (
              <div className="search-state"><p className="search-hint">Enter keywords or use filters to find candidates.</p></div>
            ) : results.length === 0 ? (
              <div className="search-state"><p className="search-hint">No candidates found. Try different search terms.</p></div>
            ) : (
              <>
                <p className="results-count">{results.length} candidate{results.length !== 1 ? 's' : ''}</p>
                <div className="job-card-list">
                  {results.map(r => (
                    <div key={r.id} className="job-card" onClick={() => navigate(`/candidate/${r.id}`)}>
                      <div className="job-card-main">
                        <div className="job-card-title">{r.seeker_full_name || 'Candidate'}</div>
                        <div className="job-card-meta">
                          {r.preferred_city && <span>📍 {r.preferred_city}{r.preferred_state ? `, ${r.preferred_state}` : ''}</span>}
                          {r.work_mode?.length > 0 && <span>🖥 {r.work_mode.join(' / ')}</span>}
                          {r.exp_years != null && <span>⏱ {r.exp_years} yrs exp</span>}
                        </div>
                        {r.skills?.length > 0 && (
                          <div className="tags-row" style={{ marginTop: 8 }}>
                            {r.skills.slice(0, 6).map(s => <span key={s} className="tag">{s}</span>)}
                          </div>
                        )}
                        {r.experience && <p className="job-card-summary">{r.experience.slice(0, 140)}…</p>}
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
