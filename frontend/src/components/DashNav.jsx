import { useNavigate } from 'react-router-dom'

export default function DashNav({ activePage = 'home', userType = 'seeker' }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    // TODO: Backend needs POST /logout endpoint
    // await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' })
    sessionStorage.clear()
    navigate('/')
  }

  const seekerTabs = [
    { id: 'home',        label: 'Home',          path: '/dashboard' },
    { id: 'recommended', label: 'Recommended',   path: '/recommended' },
    { id: 'search',      label: 'Search Jobs',   path: '/search' },
    { id: 'resume',      label: 'My Resume',     path: '/resume' },
  ]

  const employerTabs = [
    { id: 'home',        label: 'Home',           path: '/dashboard' },
    { id: 'recommended', label: 'Top Candidates', path: '/recommended' },
    { id: 'search',      label: 'Search',         path: '/search' },
    { id: 'jobs',        label: 'My Postings',    path: '/jobs' },
  ]

  const tabs = userType === 'employer' ? employerTabs : seekerTabs

  return (
    <nav className="dashnav">
      <div className="dashnav-top">
        <div className="dashnav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <img src="/favicon.svg" alt="Logo" className="navbar-logo-icon" />
          <span className="navbar-logo-text">Seekers</span>
        </div>
        <div className="dashnav-actions">
          <button className="dashnav-btn" onClick={() => navigate('/account')}>Account</button>
          <button className="dashnav-btn dashnav-btn-outline" onClick={handleLogout}>Log out</button>
        </div>
      </div>
      <div className="dashnav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`dashnav-tab ${activePage === tab.id ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
