import { useState, useEffect, use } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import DashNav from '../components/DashNav'

export default function RecommendedJobs({ API_BASE_URL }) {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isMember, setIsMember] = useState(false)



  //Change membership
  const toggleMembership = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/membership`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setIsMember(data.membership || false)
        fetchRecommended(1)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchRecommended(1)
  }, [])

  const fetchRecommended = async (pageNum) => {
    setLoading(true)
    try {
      // TODO: Backend needs GET /recommendations/jobs?page=X
      const res = await apiFetch(`${API_BASE_URL}/recommendations/jobs`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageNum })
      })
      if (res.ok) {
        const data = await res.json()
        const newJobs = data.job || []
        setJobs(prev => pageNum === 1 ? newJobs : [...prev, ...newJobs])
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

  return (
    <div className="page">
      <DashNav activePage="recommended" userType="seeker" />

      <div className="rec-page">
        <div className="rec-header">
          <div>
            <h1 className="search-title">Recommended Jobs</h1>
            <p className="search-sub">
              Jobs matched to your profile and resume — ranked by relevance.
              {!isMember && ' Upgrade to Member to unlock unlimited recommendations.'}
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

        {loading && jobs.length === 0 ? (
          <div className="search-state"><div className="spinner" /><p>Finding your best matches…</p></div>
        ) : jobs.length === 0 ? (
          <div className="search-state">
            <p className="search-hint">No recommendations yet. Make sure your resume is complete!</p>
            <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/resume')}>
              Edit Resume
            </button>
          </div>
        ) : (
          <>
            <div className="rec-list">
              {jobs.map((job, i) => (
                <div key={job.id} className="rec-card" onClick={() => navigate(`/job/${job.id}`)}>
                  <div className="rec-rank">#{i + 1}</div>
                  <div className="rec-card-main">
                    <div className="rec-card-title">{job.title}</div>
                    <div className="rec-card-company">{job.company_name}</div>
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
                  {job.match_score != null && (
                    <div className="job-card-match">
                      <span className="match-pct">{Math.round(job.match_score * 100)}%</span>
                      <span className="match-label">match</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  className="btn-secondary"
                  onClick={() => fetchRecommended(page + 1)}
                  disabled={loading}
                >
                  {loading ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}

            {!hasMore && jobs.length > 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 24 }}>
                {isMember ? 'All matches shown.' : `Showing top 10 matches. Upgrade to see more.`}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
