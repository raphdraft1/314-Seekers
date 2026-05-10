import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AccountType from './pages/AccountType'
import RegisterStep1 from './pages/RegisterStep1'
import RegisterStep2 from './pages/RegisterStep2'
import RegisterStep3 from './pages/RegisterStep3'
import EmployerStep2 from './pages/EmployerStep2'
import EmployerStep3 from './pages/EmployerStep3'
import Resume from './pages/Resume'
import HealthCheck from './test.jsx'

function App() {
  const [FIELDS_OF_STUDY, setFieldsOfStudy] = useState([])
  const [WORK_MODES, setWorkModes] = useState([])

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const EDUCATION_LEVELS = [
    { value: 1,  label: 'None' },
    { value: 2,  label: 'Secondary' },
    { value: 3,  label: 'Certificate I-II' },
    { value: 4,  label: 'Certificate III-IV' },
    { value: 5,  label: 'Diploma' },
    { value: 6,  label: 'Advanced Diploma / Associate Degree' },
    { value: 7,  label: 'Bachelor' },
    { value: 8,  label: 'Bachelor Honours / Graduate Certificate / Graduate Diploma' },
    { value: 9,  label: 'Master' },
    { value: 10, label: 'PhD / Doctoral' },
  ]

  useEffect(() => {
    
    const fetchSetup = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/setup`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
        const data = await response.json()
        setFieldsOfStudy(data.fields_of_study)
        setWorkModes(data.work_modes)
      } catch (error) {
        console.error('Error fetching setup:', error)
      }
    }
    
    fetchSetup()
  }, [])

  console.log('FIELDS_OF_STUDY:', FIELDS_OF_STUDY)
  console.log('WORK_MODES:', WORK_MODES)

  return (
    <Routes>
      <Route path="/health" element={<HealthCheck />} />
      <Route path="/" element={<AccountType />} />

      {/* Dynamic role param so RegisterStep1 knows which flow it's in */}
      <Route path="/register/:role/step1" element={<RegisterStep1 />} />

      {/* Seeker flow */}
      <Route path="/register/seeker/step2" element={<RegisterStep2 FIELDS_OF_STUDY = {FIELDS_OF_STUDY} WORK_MODES = {WORK_MODES} EDUCATION_LEVELS = {EDUCATION_LEVELS} />} />
      <Route path="/register/seeker/step3" element={<RegisterStep3 />} />

      {/* Employer flow */}
      <Route path="/register/employer/step2" element={<EmployerStep2 />} />
      <Route path="/register/employer/step3" element={<EmployerStep3 />} />

      {/* Resume page */}
      <Route path="/resume" element={<Resume FIELDS_OF_STUDY = {FIELDS_OF_STUDY} WORK_MODES = {WORK_MODES} EDUCATION_LEVELS = {EDUCATION_LEVELS} API_BASE_URL = {API_BASE_URL} />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
