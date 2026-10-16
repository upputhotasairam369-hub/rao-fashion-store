import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') ? `/${searchParams.get('redirect')}` : '/';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate(redirectPath);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F2EFE8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        
        {/* Brand Mark */}
        <Link to="/" className="inline-flex items-center space-x-2 mb-4">
          <div className="w-12 h-12 bg-[#151515] text-[#CCFF00] flex items-center justify-center font-display font-black text-2xl border border-[#151515]">
            RT
          </div>
        </Link>

        <h1 className="font-display font-black text-3xl uppercase tracking-tight text-[#151515]">
          ACCESS YOUR ACCOUNT
        </h1>
        <p className="mt-2 text-xs font-mono text-[#787873] uppercase tracking-wider">
          OR{' '}
          <Link to="/signup" className="font-bold text-[#151515] hover:text-[#CCFF00] hover:bg-[#151515] px-1 transition-all underline">
            JOIN RAO'S THRIFT FOR DROP ALERTS
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border-2 border-[#151515] p-8 shadow-brutal space-y-6">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-500 text-red-700 text-xs font-mono font-bold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="you@domain.com"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787873]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515]">
                  PASSWORD
                </label>
                <Link to="/forgot-password" className="text-[11px] font-mono text-[#787873] hover:text-[#151515] underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787873]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent py-3.5 text-xs flex items-center justify-center gap-2 shadow-brutal-sm mt-6"
            >
              <span>{loading ? 'SIGNING IN...' : 'SIGN IN TO RAO\'S THRIFT'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Credentials Reminder */}
          <div className="pt-4 border-t border-[#ECE8DF] text-[11px] font-mono text-[#787873] space-y-1">
            <p className="font-bold text-[#151515]">DEVELOPMENT TEST ACCOUNTS:</p>
            <p>Customer: test@example.com / password</p>
            <p>Admin: admin@ecommerce.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
