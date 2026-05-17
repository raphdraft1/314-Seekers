import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashNav from '../components/DashNav'

export default function JobDetail({ API_BASE_URL }) {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userType = sessionStorage.getItem('user_type') === 'company' ? 'employer' : 'seeker'

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/jobposting?jobId=${jobId}`)
        if (res.ok) {
          const data = await res.json()
          setJob(data.job)
        } else {
          setError('Job posting not found.')
        }
      } catch (err) {
        setError('Failed to load job posting. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [jobId])

  return (
    <div className="page">
      <DashNav activePage="search" userType={userType} />

      <div className="dash-page">
        <div style={{ marginBottom: 20 }}>
          <button className="btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        </div>

        {loading ? (
          <div className="dash-empty">Loading…</div>
        ) : error ? (
          <div className="api-error">{error}</div>
        ) : !job ? null : (
          <div className="dash-widget" style={{ maxWidth: 780 }}>

            {/* Header */}
            <h1 className="dash-welcome-title" style={{ marginBottom: 4 }}>{job.title}</h1>
            {job.company_name && (
              <p className="job-card-company" style={{ fontSize: 16 }}>{job.company_name}</p>
            )}
            {job.company_email && (
              <p className="job-card-company" style={{ fontSize: 14, marginBottom: 16 }}>{job.company_email}</p>
            )}

            {/* Meta row */}
            <div className="job-card-meta" style={{ marginBottom: 20 }}>
              {job.city && (
                <span>📍 {job.city}{job.state ? `, ${job.state}` : ''}{job.country ? `, ${job.country}` : ''}</span>
              )}
              {job.work_mode?.length > 0 && (
                <span>🖥 {job.work_mode.join(' / ')}</span>
              )}
              {job.exp_years != null && (
                <span>⏱ {job.exp_years}+ yrs experience</span>
              )}
            </div>

            {/* Required skills */}
            {job.required_skills?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p className="filter-section-title" style={{ marginBottom: 8 }}>Required Skills</p>
                <div className="tags-row">
                  {job.required_skills.map(s => (
                    <span key={s} className="tag">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

            {/* Summary */}
            {job.summary && (
              <div style={{ marginBottom: 24 }}>
                <p className="filter-section-title" style={{ marginBottom: 8 }}>Summary</p>
                <p className="review-block-text">{job.summary}</p>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div style={{ marginBottom: 24 }}>
                <p className="filter-section-title" style={{ marginBottom: 8 }}>Responsibilities</p>
                <p className="review-block-text">{job.responsibilities}</p>
              </div>
            )}

            {/* Education & field of study */}
            {(job.required_education != null || job.field_of_study?.length > 0) && (
              <div style={{ marginBottom: 24 }}>
                <p className="filter-section-title" style={{ marginBottom: 8 }}>Education Requirements</p>
                {job.required_education != null && (
                  <p className="review-block-text" style={{ marginBottom: 6 }}>
                    Minimum education level: {typeof job.required_education === 'object' ? Object.values(job.required_education)[0] : job.required_education}
                  </p>
                )}
                {job.field_of_study?.length > 0 && (
                  <div className="tags-row">
                    {job.field_of_study.map(f => (
                      <span key={f} className="tag">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Employer action */}
            {userType === 'employer' && (
              <div style={{ marginTop: 24 }}>
                <button
                  className="btn-primary"
                  onClick={() => navigate(`/jobs/${jobId}/edit`)}
                >
                  Edit Posting
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
