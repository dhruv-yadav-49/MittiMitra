import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const { loadDemoFarm } = useFarm();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email'); return; }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/dashboard');
    else setError('Invalid credentials');
  };

  const handleDemo = () => {
    loginAsDemo();
    loadDemoFarm();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A1A2E]">MittiMitra AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Welcome back</h1>
          <p className="text-sm text-[#6B7280] mt-1">Login to your farm dashboard</p>
        </div>

        <div className="card">
          {/* Demo button */}
          <button
            onClick={handleDemo}
            className="w-full mb-4 py-2.5 px-4 rounded-xl border-2 border-dashed border-[#52B788] bg-[#E8F5EE] text-[#2D6A4F] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#D1FAE5] transition-colors"
          >
            <span className="text-lg">🌱</span>
            Continue with Demo Farm
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#E5E0D8]" />
            <span className="text-xs text-[#6B7280]">or login with email</span>
            <div className="flex-1 h-px bg-[#E5E0D8]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="w-full px-3 py-2.5 border border-[#E5E0D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 border border-[#E5E0D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#2D6A4F] font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
