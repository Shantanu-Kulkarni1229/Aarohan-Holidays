import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import Seo from '../components/Seo';
import { API_BASE_URL } from '../api/api';
import { isAdminLoggedIn, setAdminSession } from '../utils/adminAuth';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const expired = new URLSearchParams(location.search).get('expired') === '1';
  const destination = location.state?.from?.startsWith('/admin') ? location.state.from : '/admin/dashboard';

  useEffect(() => {
    if (expired) setError('Your session has ended. Please sign in again.');
  }, [expired]);

  if (isAdminLoggedIn()) return <Navigate to={destination} replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      // Credentials are checked by the server, which returns a signed, expiring token
      const response = await axios.post(`${API_BASE_URL}/admin/login`, { username: username.trim(), password });
      const { token, expiresIn } = response.data.data;
      setAdminSession(token, expiresIn);
      navigate(destination, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError('Invalid username or password.');
      else if (status === 429) setError(err.response.data.message);
      else if (status === 503) setError('Admin login is not set up on the server yet. Please contact the developer.');
      else setError('Could not reach the server. Check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#FAF9F6' }}>
      <Seo title="Admin login" noindex />
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg mb-4" style={{ backgroundColor: '#1E9ABF' }}>
            <FiLock className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color: '#1E9ABF' }}>Admin Portal</h1>
          <p className="text-gray-600">Aarohan Holidays Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            {error && (
              <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                <FiAlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" size={20} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E9ABF]/40 focus:border-[#1E9ABF] transition"
                  placeholder="Enter your username"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" size={20} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E9ABF]/40 focus:border-[#1E9ABF] transition"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#E66926' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">© {new Date().getFullYear()} Aarohan Holidays. All rights reserved.</p>
      </div>
    </div>
  );
}
