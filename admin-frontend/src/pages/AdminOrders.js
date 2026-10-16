import React, { useState, useEffect } from 'react';
import OrderModal from '../components/OrderModal';
import { api, endpoints } from '../api/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.admin.orders.list);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.id?.toLowerCase().includes(q) ||
        o.shipping_address?.first_name?.toLowerCase().includes(q) ||
        o.shipping_address?.last_name?.toLowerCase().includes(q) ||
        o.shipping_address?.city?.toLowerCase().includes(q)
      );
    }
    setFilteredOrders(result);
  }, [orders, statusFilter, searchQuery]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateOrder = async (orderId, updateData) => {
    try {
      await api.put(endpoints.admin.orders.updateStatus(orderId), updateData);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">Delivered</span>;
      case 'shipped':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-yellow-200 text-yellow-900 border border-yellow-400">Shipped</span>;
      case 'processing':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-800 border border-blue-300">Processing</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-red-100 text-red-800 border border-red-300">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-100 text-gray-800 border border-gray-300">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b-2 border-black pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-gray-500">
            RAO'S THRIFT — ORDER FULFILLMENT
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mt-1">
            CUSTOMER ORDERS ({orders.length})
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-black p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="SEARCH ORDERS BY ID, CUSTOMER, OR CITY..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 px-3 py-2 border border-gray-300 font-mono text-xs focus:outline-none focus:border-black"
        />

        <div className="flex gap-2 text-xs font-mono uppercase">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 border capitalize ${
                statusFilter === st ? 'bg-black text-white border-black font-bold' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border-2 border-black overflow-hidden shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-gray-500">
            No customer orders matching the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs font-mono">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left font-bold uppercase">Placed On</th>
                  <th className="px-4 py-3 text-left font-bold uppercase">Customer & City</th>
                  <th className="px-4 py-3 text-left font-bold uppercase">Pieces</th>
                  <th className="px-4 py-3 text-left font-bold uppercase">Total (₹)</th>
                  <th className="px-4 py-3 text-left font-bold uppercase">Status</th>
                  <th className="px-4 py-3 text-right font-bold uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3.5 font-bold text-gray-900">#{order.id}</td>
                    <td className="px-4 py-3.5 text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="px-4 py-3.5">
                      {order.shipping_address ? (
                        <div>
                          <p className="font-bold text-gray-900">
                            {order.shipping_address.first_name} {order.shipping_address.last_name}
                          </p>
                          <p className="text-gray-500">{order.shipping_address.city}, {order.shipping_address.state}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Direct Checkout</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">{order.items?.length || 1} items</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="px-3 py-1.5 border border-black hover:bg-black hover:text-white font-bold uppercase transition-colors"
                      >
                        View & Fulfill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onUpdate={handleUpdateOrder}
      />
    </div>
  );
};

export default AdminOrders;
