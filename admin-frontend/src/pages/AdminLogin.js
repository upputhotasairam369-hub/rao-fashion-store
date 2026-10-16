import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login, error, admin } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (admin) {
      navigate('/');
    }
  }, [admin, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Admin login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151515] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-[#CCFF00] text-black font-black text-2xl flex items-center justify-center font-mono mx-auto mb-4 border border-black shadow-lg">
          RT
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white font-mono">
          RAO'S THRIFT
        </h1>
        <p className="mt-1 text-xs font-mono tracking-widest text-[#CCFF00] uppercase">
          STORE MANAGEMENT CONSOLE
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border-2 border-black p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-500 text-red-700 text-xs font-mono font-bold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 font-mono text-xs focus:outline-none focus:border-black"
                placeholder="admin@ecommerce.com"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Master Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 font-mono text-xs focus:outline-none focus:border-black"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-[#CCFF00] hover:bg-gray-800 text-xs font-mono font-bold uppercase tracking-wider transition-colors mt-6"
            >
              {loading ? 'Authenticating Operator...' : 'Authenticate & Enter Console'}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-200 text-[11px] font-mono text-gray-500">
            <p className="font-bold text-gray-800">AUTHORIZED STORE ADMINISTRATORS ONLY</p>
            <p className="mt-0.5">Test Admin: admin@ecommerce.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;