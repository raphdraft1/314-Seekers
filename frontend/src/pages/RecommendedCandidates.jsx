import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashNav from '../components/DashNav'

export default function RecommendedCandidates({ API_BASE_URL }) {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [jobPostings, setJobPostings] = useState([])
  const [selectedJob, setSelectedJob] = useState('')
  const [loading, setLoading] = useState(false)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    // Load employer's job postings so they can pick which one to get candidates for
    const fetchJobs = async () => {
      try {
      
        const res = await fetch(`${API_BASE_URL}/all_postings`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setJobPostings(data.postings || [])
          if (data.postings?.length > 0) {
            setSelectedJob(data.postings[0].id)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setJobsLoading(false)
      }
    }
    fetchJobs()
  }, [])

  useEffect(() => {
    if (selectedJob) fetchCandidates(1)
  }, [selectedJob])

  //Change membership
  const toggleMembership = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/membership`, {
        method: 'POST',
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setIsMember(data.membership || false)
        console.log('Membership status:', data.membership)
        fetchCandidates(1)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCandidates = async (pageNum) => {
    if (!selectedJob) return
    setLoading(true)
    try {
     
      const res = await fetch(
        `${API_BASE_URL}/recommendations/candidates`,
        { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobposting_id: selectedJob, page: pageNum }) }
      )
      if (res.ok) {
        const data = await res.json()
        const newCandidates = data.candidates || []
        setCandidates(prev => pageNum === 1 ? newCandidates : [...prev, ...newCandidates])
        setHasMore(data.hasMore || false)
        setIsMember(data.membership || false)
        setPage(pageNum)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectedJobObj = jobPostings.find(j => j.id === selectedJob)

  return (
    <div className="page">
      <DashNav activePage="recommended" userType="employer" />

      <div className="rec-page">
        <div className="rec-header">
          <div>
            <h1 className="search-title">Recommended Candidates</h1>
            <p className="search-sub">
              Candidates ranked by match score for your selected job posting.
              {!isMember && ' Upgrade to Member to unlock unlimited candidate recommendations.'}
            </p>
          </div>
          {!isMember && (
            <div className="membership-cta">
              <span>🔒 Free plan: Top 10 matches</span>
              <button className="btn-primary" style={{ marginLeft: 12 }} onClick={toggleMembership}>
                Upgrade
              </button>
            </div>
          )}
        </div>

        {/* Job posting selector */}
        {!jobsLoading && jobPostings.length > 0 && (
          <div className="job-selector">
            <label className="field-label" style={{ marginBottom: 6 }}>Recommend candidates for:</label>
            <select
              className="field-select"
              style={{ maxWidth: 420 }}
              value={selectedJob}
              onChange={e => { setSelectedJob(e.target.value); setCandidates([]) }}
            >
              {jobPostings.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>
        )}

        {jobsLoading ? (
          <div className="search-state"><div className="spinner" /><p>Loading your job postings…</p></div>
        ) : jobPostings.length === 0 ? (
          <div className="search-state">
            <p className="search-hint">You need at least one job posting to get candidate recommendations.</p>
            <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/jobs/new')}>
              Create Job Posting
            </button>
          </div>
        ) : loading && candidates.length === 0 ? (
          <div className="search-state"><div className="spinner" /><p>Finding top candidates…</p></div>
        ) : candidates.length === 0 ? (
          <div className="search-state">
            <p className="search-hint">No matching candidates found for this posting yet.</p>
          </div>
        ) : (
          <>
            <div className="rec-list">
              {candidates.map((r, i) => (
                <div key={r.id} className="rec-card" onClick={() => navigate(`/candidate/${r.id}`)}>
                  <div className="rec-rank">#{i + 1}</div>
                  <div className="rec-card-main">
                    <div className="rec-card-title">{r.seeker_full_name || 'Candidate'}</div>
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
                  {/* {r.match_score != null && (
                    <div className="job-card-match">
                      <span className="match-pct">{Math.round(r.match_score * 100)}%</span>
                      <span className="match-label">match</span>
                    </div>
                  )} */}
                </div>
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button className="btn-secondary" onClick={() => fetchCandidates(page + 1)} disabled={loading}>
                  {loading ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
