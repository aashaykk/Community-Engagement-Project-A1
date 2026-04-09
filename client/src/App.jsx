import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import HodDashboard from './pages/HodDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProposalViewer from './components/ProposalViewer';
import AuditTrail from './components/AuditTrail';
import api from './api';
import SimulationSandbox from './pages/SimulationSandbox';
import './App.css';

// A mock simple layout wrapper
function Layout({ children }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('vjti_user')) || { role: 'admin' };
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Only fetch if they have a token
    if (localStorage.getItem('vjti_token')) {
      api.get('/proposals').then(res => {
        setPendingCount(res.data.filter(p => p.status === 'pending' || p.status === 'resubmitted').length);
      }).catch(err => console.error(err));
    }
  }, [location.pathname]); // Update count when they navigate

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to={`/${user.role}-dashboard`} className="text-gradient" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
            VJTI Energy System
          </Link>
        </div>
        
        {/* Top Navbar Tabs */}
        <div className="navbar-tabs" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to={`/${user.role}-dashboard`} className={`nav-link ${location.pathname.includes('dashboard') ? 'active' : ''}`}>Dashboard</Link>
          
          <Link to="/approvals" className={`nav-link ${location.pathname === '/approvals' ? 'active' : ''}`} style={{ position: 'relative' }}>
            Pending Approvals
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-12px', background: 'var(--status-danger)', 
                color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)', fontWeight: 'bold'
              }}>{pendingCount}</span>
            )}
          </Link>
          
          <Link to="/audit" className={`nav-link ${location.pathname === '/audit' ? 'active' : ''}`}>Audit Trail</Link>
          <Link to="/simulation" className={`nav-link ${location.pathname === '/simulation' ? 'active' : ''}`}>Simulation Sandbox</Link>
        </div>

        <div className="navbar-user">
          <button className="btn btn-secondary" onClick={() => {
            localStorage.removeItem('vjti_user');
            localStorage.removeItem('vjti_token');
            window.location.href = '/';
          }}>Logout</button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      
      {/* Styles for Nav Links inside Layout */}
      <style>{`
        .nav-link {
          color: var(--text-secondary);
          font-weight: 500;
          text-decoration: none;
          padding: 0.5rem 0;
          transition: color var(--transition-fast);
          border-bottom: 2px solid transparent;
        }
        .nav-link:hover {
          color: var(--text-primary);
        }
        .nav-link.active {
          color: var(--brand-primary);
          border-bottom: 2px solid var(--brand-primary);
        }
      `}</style>
    </div>
  );
}

// Protected route wrapper (Mocked for now)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('vjti_user'));
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/hod-dashboard" element={<ProtectedRoute allowedRoles={['hod']}><HodDashboard /></ProtectedRoute>} />
        <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />

        {/* New Tab Routes */}
        <Route path="/approvals" element={
          <ProtectedRoute>
            <div className="animate-fade-in-up">
              <h2 className="mb-4">Pending Proposals Review</h2>
              <ProposalViewer />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/audit" element={
          <ProtectedRoute>
            <div className="animate-fade-in-up">
              <h2 className="mb-4">System Event Audit Log</h2>
              <AuditTrail />
            </div>
          </ProtectedRoute>
        } />

        <Route path="/simulation" element={
          <ProtectedRoute>
            <SimulationSandbox />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
