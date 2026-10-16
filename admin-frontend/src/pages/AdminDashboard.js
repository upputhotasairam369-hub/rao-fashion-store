import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, endpoints } from '../api/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    low_stock_products: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        api.get(endpoints.admin.stats),
        api.get(endpoints.admin.orders.list).catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data.slice(0, 5) : []);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b-2 border-black pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-gray-500">
            RAO'S THRIFT — STORE MANAGEMENT
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mt-1">
            EXECUTIVE OVERVIEW
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-xs font-mono font-bold uppercase"
          >
            Manage Inventory
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 border border-black hover:bg-gray-100 text-xs font-mono font-bold uppercase"
          >
            Fulfillment Queue
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white border-2 border-black p-5 shadow-sm">
          <div className="text-xs font-mono uppercase text-gray-500 tracking-wider">
            TOTAL REALIZED REVENUE
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2 font-mono">
            ₹{Number(stats.total_revenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-mono text-emerald-700 mt-1 font-bold">
            CALCULATED FROM ACTUAL ORDERS
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border-2 border-black p-5 shadow-sm">
          <div className="text-xs font-mono uppercase text-gray-500 tracking-wider">
            LIFETIME ORDERS
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2 font-mono">
            {stats.total_orders}
          </div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">
            PENDING ACTION: <span className="font-bold text-amber-600">{stats.pending_orders}</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border-2 border-black p-5 shadow-sm">
          <div className="text-xs font-mono uppercase text-gray-500 tracking-wider">
            ACTIVE THRIFT PIECES
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2 font-mono">
            {stats.total_products}
          </div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">
            CURATED CATALOG ITEMS
          </div>
        </div>

        {/* Low Stock Pieces */}
        <div className="bg-white border-2 border-black p-5 shadow-sm">
          <div className="text-xs font-mono uppercase text-gray-500 tracking-wider">
            LOW STOCK / 1-OF-1 ITEMS
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2 font-mono">
            {stats.low_stock_products}
          </div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">
            PIECES WITH ≤ 3 UNITS REMAINING
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border-2 border-black shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold uppercase tracking-wider text-sm font-mono text-gray-900">
            RECENT STORE ORDERS
          </h2>
          <Link to="/orders" className="text-xs font-mono text-black hover:underline font-bold uppercase">
            VIEW ALL ORDERS →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-gray-500">
            No customer orders placed yet. Orders created on customer storefront will show here instantly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs font-mono">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left font-bold uppercase">Customer Details</th>
                  <th className="px-4 py-3 text-left font-bold uppercase">Items</th>
                  <th className="px-4 py-3 text-left font-bold uppercase">Total (₹)</th>
                  <th className="px-4 py-3 text-left font-bold uppercase">Status</th>
                  <th className="px-4 py-3 text-right font-bold uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-900">#{ord.id}</td>
                    <td className="px-4 py-3">
                      {ord.shipping_address ? (
                        <div>
                          <p className="font-bold text-gray-900">{ord.shipping_address.first_name} {ord.shipping_address.last_name}</p>
                          <p className="text-gray-500">{ord.shipping_address.city}, {ord.shipping_address.state}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Direct Checkout</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{ord.items?.length || 1} pieces</td>
                    <td className="px-4 py-3 font-bold">₹{Number(ord.total).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 uppercase text-[10px] font-bold border border-black bg-gray-100">
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate('/orders')}
                        className="text-black underline font-bold hover:text-gray-600"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
