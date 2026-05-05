import { useNavigate } from 'react-router-dom'

export default function DashNav({ activePage = 'home' }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    // TODO: call POST /api/logout when backend adds the endpoint
    // await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' })
    sessionStorage.clear()
    navigate('/')
  }

  return (
    <nav className="dashnav">
      <div className="dashnav-top">
        <div className="dashnav-logo">
          <img src="/favicon.svg" alt="Logo" className="navbar-logo-icon" />
          <span className="navbar-logo-text">Seekers</span>
        </div>
        <div className="dashnav-actions">
          <button className="dashnav-btn" onClick={() => navigate('/account')}>Account</button>
          <button className="dashnav-btn dashnav-btn-outline" onClick={handleLogout}>Log out</button>
        </div>
      </div>
      <div className="dashnav-tabs">
        <button className={`dashnav-tab ${activePage === 'home' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>Home</button>
        <button className={`dashnav-tab ${activePage === 'recommended' ? 'active' : ''}`} onClick={() => navigate('/recommended')}>Recommended</button>
        <button className={`dashnav-tab ${activePage === 'search' ? 'active' : ''}`} onClick={() => navigate('/search')}>Search</button>
      </div>
    </nav>
  )
}
