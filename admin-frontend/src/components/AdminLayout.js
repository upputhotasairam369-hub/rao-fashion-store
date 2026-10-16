import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLayout = ({ children }) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      {/* Admin Header */}
      <header className="bg-black text-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 bg-[#CCFF00] text-black font-black text-xl flex items-center justify-center font-mono">
                  RT
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-base font-bold uppercase tracking-tight text-white">
                  RAO'S THRIFT
                </h1>
                <p className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase">
                  STORE MANAGEMENT CONSOLE
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-xs font-mono text-gray-300">
                OPERATOR: <span className="font-bold text-white">{admin?.email || admin?.first_name || 'Admin'}</span>
              </span>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-block px-3 py-1.5 border border-gray-600 hover:border-[#CCFF00] text-[#CCFF00] text-xs font-mono font-bold uppercase transition-colors"
              >
                Storefront ↗
              </a>
              <button
                onClick={handleLogout}
                className="bg-white text-black hover:bg-[#CCFF00] px-3.5 py-1.5 text-xs font-mono font-bold uppercase transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-60 bg-white border-r-2 border-black min-h-[calc(100vh-4rem)] flex-shrink-0">
          <div className="p-4 space-y-6">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider mb-2">
                MAIN NAVIGATION
              </p>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/"
                    className={`flex items-center px-3 py-2 text-xs font-mono font-bold uppercase transition-colors ${
                      isActive('/') 
                        ? 'bg-black text-[#CCFF00]' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard Overview
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className={`flex items-center px-3 py-2 text-xs font-mono font-bold uppercase transition-colors ${
                      isActive('/products') 
                        ? 'bg-black text-[#CCFF00]' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Pieces & Inventory
                  </Link>
                </li>
                <li>
                  <Link
                    to="/orders"
                    className={`flex items-center px-3 py-2 text-xs font-mono font-bold uppercase transition-colors ${
                      isActive('/orders') 
                        ? 'bg-black text-[#CCFF00]' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Fulfillment Orders
                  </Link>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200 text-[10px] font-mono text-gray-400 leading-relaxed">
              RAO'S THRIFT ADMIN<br />
              FASTAPI + POSTGRESQL<br />
              SINGLE-STOCK ENGINE ACTIVE
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
