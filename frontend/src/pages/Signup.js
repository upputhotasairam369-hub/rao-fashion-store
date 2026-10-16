import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Mail, Lock } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const result = await signup({
        first_name: formData.firstName,
        last_name: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Signup failed. Please try a different email.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          JOIN RAO'S THRIFT
        </h1>
        <p className="mt-2 text-xs font-mono text-[#787873] uppercase tracking-wider">
          ALREADY AN ARCHIVE MEMBER?{' '}
          <Link to="/login" className="font-bold text-[#151515] hover:text-[#CCFF00] hover:bg-[#151515] px-1 transition-all underline">
            SIGN IN HERE
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                  FIRST NAME *
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="First"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                  LAST NAME *
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Last"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                EMAIL ADDRESS *
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
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                CREATE PASSWORD *
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="Min. 6 characters"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787873]" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                CONFIRM PASSWORD *
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="Re-enter password"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787873]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent py-3.5 text-xs flex items-center justify-center gap-2 shadow-brutal-sm mt-6"
            >
              <span>{loading ? 'CREATING ACCOUNT...' : 'CREATE RAO\'S THRIFT ACCOUNT'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="pt-2 text-[10px] font-mono text-[#787873] text-center border-t border-[#ECE8DF]">
            By creating an account, you agree to RAO'S THRIFT Terms of Service & Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
