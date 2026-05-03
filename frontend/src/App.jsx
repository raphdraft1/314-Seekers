import { Routes, Route, Navigate } from 'react-router-dom'
import AccountType from './pages/AccountType'
import RegisterStep1 from './pages/RegisterStep1'
import RegisterStep2 from './pages/RegisterStep2'
import RegisterStep3 from './pages/RegisterStep3'
import HealthCheck from './test.jsx'
import Login from './pages/Login.jsx'

function App() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  return (
    <Routes>
      <Route path="/health" element={<HealthCheck />} />
      <Route path="/" element={<AccountType />} />
      <Route path="/register/:role/step1" element={<RegisterStep1 />} />
      <Route path="/register/:role/step2" element={<RegisterStep2 />} />
      <Route path="/register/:role/step3" element={<RegisterStep3 />} />
      <Route path="/login" element={<Login API_BASE_URL={API_BASE_URL} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App