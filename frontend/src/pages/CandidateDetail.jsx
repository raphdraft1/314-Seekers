import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import DashNav from '../components/DashNav'
// reads candidateId from URl
export default function CandidateDetail({ API_BASE_URL }) {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        // API call to fetch candidate resume by ID (Needs a route to get_resume_by_id)
        const res = await apiFetch(`${API_BASE_URL}/resume`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ resume_id: candidateId })
        })
        if (res.ok) {
          const data = await res.json()
          setResume(data.resumes[0])
        } else {
          setError('Candidate profile not found.')
        }
      } catch {
        setError('Failed to load candidate profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchCandidate()
  }, [candidateId])

  const eduLabel = resume?.education != null
    ? Object.values(resume.education)[0]
    : null

  const preferredLocation = [resume?.preferred_city, resume?.preferred_state, resume?.preferred_country]
    .filter(Boolean).join(', ')

  return (
    <div className="page">
      <DashNav activePage="search" userType="employer" />

      <div className="dash-page">
        <div style={{ marginBottom: 20 }}>
          <button className="btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        </div>

        {loading ? (
          <div className="dash-empty">Loading…</div>
        ) : error ? (
          <div className="api-error">{error}</div>
        ) : !resume ? null : (
          <div className="dash-widget" style={{ maxWidth: 780 }}>

            {/* Header */}
            <h1 className="dash-welcome-title" style={{ marginBottom: 4 }}>
              {resume.seeker_full_name || 'Candidate'}
              {resume.email && (
              <p className="job-card-company" style={{ fontSize: 14, marginBottom: 16 }}>{resume.email}</p>
            )}
            </h1>
            {/* Meta row */}
            <div className="job-card-meta" style={{ marginBottom: 20 }}>
              {preferredLocation && <span>📍 {preferredLocation}</span>}
              {resume.work_mode?.length > 0 && <span>🖥 {resume.work_mode.join(' / ')}</span>}
              {resume.exp_years != null && <span>⏱ {resume.exp_years} yrs experience</span>}
            </div>

            {/* Skills */}
            {resume.skills?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p className="filter-section-title" style={{ marginBottom: 8 }}>Skills</p>
                <div className="tags-row">
                  {resume.skills.map(s => (
                    <span key={s} className="tag">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

            {/* Experience */}
            {resume.experience && (
              <div style={{ marginBottom: 24 }}>
                <p className="filter-section-title" style={{ marginBottom: 8 }}>Experience</p>
                <p className="review-block-text">{resume.experience}</p>
              </div>
            )}

            {/* Education */}
            {(eduLabel || resume.field_of_study?.length > 0) && (
              <div style={{ marginBottom: 24 }}>
                <p className="filter-section-title" style={{ marginBottom: 8 }}>Education</p>
                {eduLabel && (
                  <p className="review-block-text" style={{ marginBottom: 6 }}>{eduLabel}</p>
                )}
                {resume.field_of_study?.length > 0 && (
                  <div className="tags-row">
                    {resume.field_of_study.map(f => (
                      <span key={f} className="tag">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
