import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      
      localStorage.setItem('vjti_token', token);
      localStorage.setItem('vjti_user', JSON.stringify(user));
      
      toast.success('Login Successful');
      navigate(`/${user.role}-dashboard`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Login failed. Proceeding with Mock fallback.');
      
      // Fallback for UI visualization
      const fallbackUser = { email, role: 'admin' };
      if (email.includes('hod')) fallbackUser.role = 'hod';
      if (email.includes('student')) fallbackUser.role = 'student';
      
      localStorage.setItem('vjti_user', JSON.stringify(fallbackUser));
      navigate(`/${fallbackUser.role}-dashboard`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Toaster position="top-right" />
      <div className="login-box card animate-fade-in-up">
        <div className="text-center mb-4">
          <h1 className="text-gradient">VJTI Energy</h1>
          <p className="text-muted">Smart Consumption & Solar Simulation</p>
        </div>

        <form onSubmit={handleLogin} className="flex" style={{ flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Adddress</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
             <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>



          <button type="submit" className="btn btn-primary mt-4 w-full">
            Sign In to Dashboard
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Mock Login is active for Phase 4 UI setup.</p>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .login-box {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem 2rem;
        }
      `}</style>
    </div>
  );
}
