import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashNav from '../components/DashNav'

export default function ManageJobs({ API_BASE_URL }) {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // TODO: Backend needs GET /postings
        const res = await fetch(`${API_BASE_URL}/postings`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setJobs(data.postings || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  return (
    <div className="page">
      <DashNav activePage="home" userType="employer" />

      <div className="dash-page">
        <div className="dash-welcome">
          <div>
            <h1 className="dash-welcome-title">Your Job Postings</h1>
            <p className="dash-welcome-sub">{jobs.length} posting{jobs.length !== 1 ? 's' : ''} active</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/jobs/new')}>+ Post a Job</button>
        </div>

        {loading ? (
          <div className="dash-empty">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="dash-widget">
            <div className="dash-empty">
              <p>You haven't posted any jobs yet.</p>
              <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/jobs/new')}>
                Create your first job posting
              </button>
            </div>
          </div>
        ) : (
          <div className="dash-widget">
            <div className="job-card-list">
              {jobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-card-main">
                    <div className="job-card-title">{job.title}</div>
                    <div className="job-card-meta">
                      {job.city && <span>📍 {job.city}{job.state ? `, ${job.state}` : ''}</span>}
                      {job.work_mode?.length > 0 && <span>🖥 {job.work_mode.join(' / ')}</span>}
                      {job.exp_years != null && <span>⏱ {job.exp_years}+ yrs</span>}
                    </div>
                    {job.summary && <p className="job-card-summary">{job.summary.slice(0, 100)}…</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '6px 14px' }}
                      onClick={() => navigate(`/recommended?job=${job.id}`)}
                    >
                      Candidates
                    </button>
                    <button
                      className="btn-primary"
                      style={{ fontSize: 12, padding: '6px 14px' }}
                      onClick={() => navigate(`/jobs/${job.id}/edit`)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
