import { Routes, Route } from 'react-router-dom'
import HealthCheck from './test.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HealthCheck />} />
    </Routes>
  )
}

export default App