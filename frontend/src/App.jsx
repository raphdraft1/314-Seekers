import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

// Auth & onboarding
import AccountType from './pages/AccountType'
import Login from './pages/Login'
import RegisterStep1 from './pages/RegisterStep1'
import RegisterStep2 from './pages/RegisterStep2'
import RegisterStep3 from './pages/RegisterStep3'
import EmployerStep2 from './pages/EmployerStep2'
import EmployerStep3 from './pages/EmployerStep3'

// Seeker pages
import SeekerDashboard from './pages/SeekerDashboard'
import Resume from './pages/Resume'
import JobSearch from './pages/JobSearch'
import RecommendedJobs from './pages/RecommendedJobs'

// Employer pages
import EmployerDashboard from './pages/EmployerDashboard'
import CandidateSearch from './pages/CandidateSearch'
import RecommendedCandidates from './pages/RecommendedCandidates'
import JobPostingForm from './pages/JobPostingForm'
import ManageJobs from './pages/ManageJobs'

// Dev
import HealthCheck from './test.jsx'

function App() {
  const [FIELDS_OF_STUDY, setFieldsOfStudy] = useState([])
  const [WORK_MODES, setWorkModes] = useState([])
  const [EDUCATION_LEVELS, setEducationLevels] = useState([])

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const fetchSetup = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/setup`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await response.json()
        setFieldsOfStudy(data.fields_of_study)
        setWorkModes(data.work_modes)
        setEducationLevels(
          Object.entries(data.education_levels).map(([key, value]) => ({
            value: Number(key),
            label: value,
          }))
        )
      } catch (error) {
        console.error('Error fetching setup:', error)
      }
    }
    fetchSetup()
  }, [])

  const enumProps = { FIELDS_OF_STUDY, WORK_MODES, EDUCATION_LEVELS, API_BASE_URL }

  // Redirect to correct dashboard / search / recommended based on user_type in sessionStorage
  // The login + registration flows must write sessionStorage.setItem('user_type', 'seeker'|'company')
  const DashboardRedirect = () => {
    const t = sessionStorage.getItem('user_type')
    if (t === 'company') return <EmployerDashboard API_BASE_URL={API_BASE_URL} />
    return <SeekerDashboard API_BASE_URL={API_BASE_URL} />
  }

  const SearchRedirect = () => {
    const t = sessionStorage.getItem('user_type')
    if (t === 'company') return <CandidateSearch {...enumProps} />
    return <JobSearch {...enumProps} />
  }

  const RecommendedRedirect = () => {
    const t = sessionStorage.getItem('user_type')
    if (t === 'company') return <RecommendedCandidates API_BASE_URL={API_BASE_URL} />
    return <RecommendedJobs API_BASE_URL={API_BASE_URL} />
  }

  return (
    <Routes>
      {/* Dev */}
      <Route path="/health" element={<HealthCheck />} />

      {/* Auth / onboarding */}
      <Route path="/" element={<AccountType />} />
      <Route path="/login" element={<Login API_BASE_URL={API_BASE_URL} />} />
      <Route path="/register/:role/step1" element={<RegisterStep1 />} />
      <Route path="/register/seeker/step2" element={<RegisterStep2 {...enumProps} />} />
      <Route path="/register/seeker/step3" element={<RegisterStep3 />} />
      <Route path="/register/employer/step2" element={<EmployerStep2 />} />
      <Route path="/register/employer/step3" element={<EmployerStep3 />} />

      {/* Shared — renders correct component based on sessionStorage user_type */}
      <Route path="/dashboard"   element={<DashboardRedirect />} />
      <Route path="/search"      element={<SearchRedirect />} />
      <Route path="/recommended" element={<RecommendedRedirect />} />

      {/* Seeker only */}
      <Route path="/resume" element={<Resume {...enumProps} />} />

      {/* Employer only */}
      <Route path="/jobs"             element={<ManageJobs API_BASE_URL={API_BASE_URL} />} />
      <Route path="/jobs/new"         element={<JobPostingForm {...enumProps} />} />
      <Route path="/jobs/:jobId/edit" element={<JobPostingForm {...enumProps} />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
