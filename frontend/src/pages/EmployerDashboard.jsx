import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashNav from '../components/DashNav'

export default function EmployerDashboard({ API_BASE_URL }) {
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [jobPostings, setJobPostings] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyRes = await fetch(`${API_BASE_URL}/getCompany`, {
          method: 'POST',
          credentials: 'include',
        })
        if (companyRes.ok) {
          const data = await companyRes.json()
          setCompany(data.company)
        } else {
          navigate('/')
        }

        const jobsRes = await fetch(`${API_BASE_URL}/all_postings`, {
          credentials: 'include',
        })
        if (jobsRes.ok) {
          const data = await jobsRes.json()
          setJobPostings(data.postings || [])
        }

        // TODO: Backend needs GET /recommendations/candidates?jobposting_id=X
        const recRes = await fetch(`${API_BASE_URL}/recommendations/candidates`, {
          credentials: 'include',
        })
        if (recRes.ok) {
          const data = await recRes.json()
          setRecommended((data.resumes || []).slice(0, 3))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="page">
      <DashNav activePage="home" userType="employer" />

      <div className="dash-page">
        <div className="dash-welcome">
          <div>
            <h1 className="dash-welcome-title">
              Welcome back{company ? `, ${company.name}` : ''}! 🏢
            </h1>
            <p className="dash-welcome-sub">Manage your job postings and find top candidates.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/jobs/new')}>
            + Post a Job
          </button>
        </div>

        <div className="dash-grid">
          {/* Recommended Candidates */}
          <div className="dash-widget dash-widget-wide">
            <div className="dash-widget-header">
              <h2 className="dash-widget-title">Top Candidates</h2>
              <button className="dash-widget-link" onClick={() => navigate('/recommended')}>
                View all →
              </button>
            </div>
            {recommended.length === 0 ? (
              <div className="dash-empty">
                <p>Post a job to see recommended candidates.</p>
                <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/jobs/new')}>
                  Create Job Posting
                </button>
              </div>
            ) : (
              <div className="candidate-card-list">
                {recommended.map(r => (
                  <CandidateCard key={r.id} resume={r} onClick={() => navigate(`/candidate/${r.id}`)} showMatch />
                ))}
              </div>
            )}
          </div>

          {/* Company profile summary */}
          <div className="dash-widget">
            <div className="dash-widget-header">
              <h2 className="dash-widget-title">Company Profile</h2>
              <button className="dash-widget-link" onClick={() => navigate('/account')}>Edit →</button>
            </div>
            {!company ? (
              <div className="dash-empty">Loading…</div>
            ) : (
              <div className="profile-summary">
                <div className="profile-avatar company-avatar">
                  {company.company_name?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <p className="profile-name">{company.company_name}</p>
                  <p className="profile-meta">{company.email}</p>
                  {company.industry && <p className="profile-meta">🏭 {company.industry}</p>}
                  {company.city && <p className="profile-meta">📍 {company.city}{company.state ? `, ${company.state}` : ''}</p>}
                  {company.founded_year && <p className="profile-meta">📅 Founded {company.founded_year}</p>}
                </div>
                <div className="membership-badge" data-member={company.membership}>
                  {company.membership ? '★ Member' : 'Free Plan'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Postings list */}
        <div className="dash-widget" style={{ marginTop: 24 }}>
          <div className="dash-widget-header">
            <h2 className="dash-widget-title">Your Job Postings</h2>
            <button className="dash-widget-link" onClick={() => navigate('/jobs')}>Manage all →</button>
          </div>
          {loading ? (
            <div className="dash-empty">Loading…</div>
          ) : jobPostings.length === 0 ? (
            <div className="dash-empty">
              <p>No job postings yet.</p>
              <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/jobs/new')}>
                Create your first posting
              </button>
            </div>
          ) : (
            <div className="job-card-list">
              {jobPostings.slice(0, 5).map(job => (
                <div key={job.id} className="job-card" onClick={() => navigate(`/jobs/${job.id}/edit`)}>
                  <div className="job-card-main">
                    <div className="job-card-title">{job.title}</div>
                    <div className="job-card-meta">
                      {job.city && <span>📍 {job.city}{job.state ? `, ${job.state}` : ''}</span>}
                      {job.work_mode?.length > 0 && <span>🖥 {job.work_mode.join(' / ')}</span>}
                    </div>
                  </div>
                  <button className="btn-secondary" style={{ flexShrink: 0, fontSize: 12, padding: '6px 14px' }}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CandidateCard({ resume, onClick, showMatch }) {
  return (
    <div className="job-card" onClick={onClick}>
      <div className="job-card-main">
        <div className="job-card-title">{resume.seeker_full_name || 'Candidate'}</div>
        <div className="job-card-meta">
          {resume.preferred_city && <span>📍 {resume.preferred_city}</span>}
          {resume.work_mode?.length > 0 && <span>🖥 {resume.work_mode.join(' / ')}</span>}
          {resume.exp_years != null && <span>⏱ {resume.exp_years} yrs exp</span>}
        </div>
        {resume.skills?.length > 0 && (
          <div className="tags-row">
            {resume.skills.slice(0, 4).map(s => <span key={s} className="tag">{s}</span>)}
          </div>
        )}
      </div>
      {showMatch && resume.match_score != null && (
        <div className="job-card-match">
          <span className="match-pct">{Math.round(resume.match_score * 100)}%</span>
          <span className="match-label">match</span>
        </div>
      )}
    </div>
  )
}
