import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashNav from '../components/DashNav'

export default function SeekerDashboard({ API_BASE_URL }) {
  const navigate = useNavigate()
  const [seeker, setSeeker] = useState(null)
  const [recommended, setRecommended] = useState([])
  const [Jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [recLoading, setRecLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch seeker profile
        const seekerRes = await fetch(`${API_BASE_URL}/getSeeker`, {
          method: 'POST',
          credentials: 'include',
        })
        if (seekerRes.ok) {
          const data = await seekerRes.json()
          setSeeker(data.seeker)
        } else {
          navigate('/')
        }

        // Fetch 3 job postings 
        const jobsRes = await fetch(`${API_BASE_URL}/search/jobs`, {
          credentials: 'include',
        })
        if (jobsRes.ok) {
          const data = await jobsRes.json()
          setJobs((data.jobs || []).slice(0, 3))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const fetchRecommended = async () => {
      try {
        // Get 3 recommendations
        const res = await fetch(`${API_BASE_URL}/recommendations/jobs`, {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setRecommended((data.job || []).slice(0, 3))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setRecLoading(false)
      }
    }

    fetchData()
    fetchRecommended()
    console.log("Jobs: ", Jobs)
    console.log("Recommended: ", recommended)
  }, [])

  return (
    <div className="page">
      <DashNav activePage="home" userType="seeker" />

      <div className="dash-page">
        {/* Welcome banner */}
        <div className="dash-welcome">
          <div>
            <h1 className="dash-welcome-title">
              Welcome back{seeker ? `, ${seeker.full_name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="dash-welcome-sub">Here's what's happening with your job search today.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/resume')}>
            Edit Resume
          </button>
        </div>

        <div className="dash-grid">
          {/* Recommended Jobs widget */}
          <div className="dash-widget dash-widget-wide">
            <div className="dash-widget-header">
              <h2 className="dash-widget-title">Recommended for You</h2>
              <button className="dash-widget-link" onClick={() => navigate('/recommended')}>
                View all →
              </button>
            </div>

            {recLoading ? (
              <div className="dash-empty">Loading recommendations…</div>
            ) : recommended.length === 0 ? (
              <div className="dash-empty">
                <p>No recommendations yet. Complete your resume to get matched!</p>
                <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/resume')}>
                  Complete Resume
                </button>
              </div>
            ) : (
              <div className="job-card-list">
                {recommended.map(job => (
                  <JobCard key={job.id} job={job} onClick={() => navigate(`/job/${job.id}`)} showMatch />
                ))}
              </div>
            )}
          </div>

          {/* Profile Summary widget */}
          <div className="dash-widget">
            <div className="dash-widget-header">
              <h2 className="dash-widget-title">Your Profile</h2>
              <button className="dash-widget-link" onClick={() => navigate('/resume')}>Edit →</button>
            </div>
            {loading || !seeker ? (
              <div className="dash-empty">Loading…</div>
            ) : (
              <div className="profile-summary">
                <div className="profile-avatar">
                  {seeker.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <p className="profile-name">{seeker.full_name}</p>
                  <p className="profile-meta">{seeker.email}</p>
                  {seeker.city && (
                    <p className="profile-meta">📍 {seeker.city}{seeker.state ? `, ${seeker.state}` : ''}</p>
                  )}
                  {seeker.short_desc && (
                    <p className="profile-desc">{seeker.short_desc}</p>
                  )}
                </div>
                <div className="membership-badge" data-member={seeker.membership}>
                  {seeker.membership ? '★ Member' : 'Free Plan'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Job Listings */}
        <div className="dash-widget" style={{ marginTop: 24 }}>
          <div className="dash-widget-header">
            <h2 className="dash-widget-title">Browse Jobs</h2>
            <button className="dash-widget-link" onClick={() => navigate('/search')}>
              Search all →
            </button>
          </div>
          {Jobs.length === 0 ? (
            <div className="dash-empty">No job postings found.</div>
          ) : (
            <div className="job-card-list">
              {Jobs.map(job => (
                <JobCard key={job.id} job={job} onClick={() => navigate(`/job/${job.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function JobCard({ job, onClick, showMatch }) {
  return (
    <div className="job-card" onClick={onClick}>
      <div className="job-card-main">
        <div className="job-card-title">{job.title || 'Untitled Position'}</div>
        <div className="job-card-company">{job.company_name || 'Company'}</div>
        <div className="job-card-meta">
          {job.city && <span>📍 {job.city}{job.state ? `, ${job.state}` : ''}</span>}
          {job.work_mode?.length > 0 && <span>🖥 {job.work_mode.join(' / ')}</span>}
          {job.exp_years != null && <span>⏱ {job.exp_years}+ yrs</span>}
        </div>
        {job.summary && <p className="job-card-summary">{job.summary.slice(0, 120)}…</p>}
      </div>
      {showMatch && job.match_score != null && (
        <div className="job-card-match">
          <span className="match-pct">{Math.round(job.match_score * 100)}%</span>
          <span className="match-label">match</span>
        </div>
      )}
    </div>
  )
}
