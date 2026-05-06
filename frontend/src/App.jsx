import { Routes, Route, Navigate } from 'react-router-dom'
import AccountType from './pages/AccountType'
import RegisterStep1 from './pages/RegisterStep1'
import RegisterStep2 from './pages/RegisterStep2'
import RegisterStep3 from './pages/RegisterStep3'
import EmployerStep2 from './pages/EmployerStep2'
import EmployerStep3 from './pages/EmployerStep3'
import Resume from './pages/Resume'
import HealthCheck from './test.jsx'

function App() {
  return (
    <Routes>
      <Route path="/health" element={<HealthCheck />} />
      <Route path="/" element={<AccountType />} />

      {/* Dynamic role param so RegisterStep1 knows which flow it's in */}
      <Route path="/register/:role/step1" element={<RegisterStep1 />} />

      {/* Seeker flow */}
      <Route path="/register/seeker/step2" element={<RegisterStep2 />} />
      <Route path="/register/seeker/step3" element={<RegisterStep3 />} />

      {/* Employer flow */}
      <Route path="/register/employer/step2" element={<EmployerStep2 />} />
      <Route path="/register/employer/step3" element={<EmployerStep3 />} />

      {/* Resume page */}
      <Route path="/resume" element={<Resume />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
