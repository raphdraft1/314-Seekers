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

import JobDetail from './pages/JobDetail'
import CandidateDetail from './pages/CandidateDetail'

// Dev
import HealthCheck from './test.jsx'

function App() {
  const [FIELDS_OF_STUDY, setFieldsOfStudy] = useState([])
  const [WORK_MODES, setWorkModes] = useState([])
  const [EDUCATION_LEVELS, setEducationLevels] = useState([])
  const [TYPE, setType] = useState('')

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


  return (
    <Routes>
      {/* Dev */}
      <Route path="/health" element={<HealthCheck />} />

      {/* Auth / onboarding */}
      <Route path="/" element={<AccountType />} />
      <Route path="/login" element={<Login API_BASE_URL={API_BASE_URL} TYPE={TYPE} setType={setType} />} />
      <Route path="/register/:role/step1" element={<RegisterStep1 />} />
      <Route path="/register/employer/step2" element={<EmployerStep2 />} />
      <Route path="/register/employer/step3" element={<EmployerStep3 />} />
      <Route path="/register/:role/step2" element={<RegisterStep2 {...enumProps} />} />
      <Route path="/register/:role/step3" element={<RegisterStep3 API_BASE_URL={API_BASE_URL} />} />

      {/* Shared — renders correct component based on sessionStorage user_type */}
      <Route path="/dashboard"   element={TYPE === 'company' ? <EmployerDashboard API_BASE_URL={API_BASE_URL} /> : <SeekerDashboard API_BASE_URL={API_BASE_URL} />} />
      <Route path="/search"      element={TYPE === 'company' ? <CandidateSearch {...enumProps} /> : <JobSearch {...enumProps} />} />
      <Route path="/recommended" element={TYPE === 'company' ? <RecommendedCandidates API_BASE_URL={API_BASE_URL} /> : <RecommendedJobs API_BASE_URL={API_BASE_URL} />} />

      {/* Seeker only */}
      <Route path="/resume" element={<Resume {...enumProps} />} />

      {/* Employer only */}
      <Route path="/jobs"             element={<ManageJobs API_BASE_URL={API_BASE_URL} />} />
      <Route path="/jobs/new"         element={<JobPostingForm {...enumProps} />} />
      <Route path="/jobs/:jobId/edit" element={<JobPostingForm {...enumProps} />} />

      <Route path="/job/:jobId" element={<JobDetail API_BASE_URL={API_BASE_URL} />} />
      <Route path="/candidate/:candidateId" element={<CandidateDetail {...enumProps} />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
