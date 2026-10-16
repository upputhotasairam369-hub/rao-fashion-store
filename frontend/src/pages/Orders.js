import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, endpoints } from '../api/api';
import { Package, Truck, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.orders.list);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
            DELIVERED
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-[#CCFF00] text-[#151515] border border-[#151515]">
            IN TRANSIT (SHIPPED)
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-[#F2EFE8] text-[#151515] border border-[#151515]">
            PROCESSING AT HUB
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-red-100 text-red-800 border border-red-300">
            CANCELLED
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-100 text-amber-900 border border-amber-300">
            ORDER RECEIVED
          </span>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F2EFE8] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white border-2 border-[#151515] p-10 text-center shadow-brutal">
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-[#151515] mb-2">
            ACCOUNT ACCESS REQUIRED
          </h2>
          <p className="text-xs font-mono text-[#787873] mb-6">
            Please log in to your Rao's Thrift account to review your past orders and tracking.
          </p>
          <Link to="/login?redirect=orders" className="btn-accent w-full block py-3.5 text-center text-xs">
            LOG IN TO YOUR ACCOUNT →
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2EFE8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#151515] border-t-[#CCFF00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EFE8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="border-b-2 border-[#151515] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-[#787873] uppercase mb-1">
              ACCOUNT DASHBOARD
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#151515]">
              ORDER HISTORY
            </h1>
          </div>
          <div className="text-xs font-mono text-[#151515] bg-white px-3 py-1.5 border border-[#D6D3CD] self-start sm:self-auto">
            LOGGED IN AS: <span className="font-bold">{user?.email}</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border-2 border-[#151515] p-12 text-center shadow-brutal max-w-lg mx-auto my-12">
            <Package size={40} className="mx-auto text-[#787873] mb-4" />
            <h3 className="font-display font-black text-2xl uppercase text-[#151515] mb-2">
              NO ORDERS PLACED YET
            </h3>
            <p className="text-xs font-mono text-[#787873] mb-6">
              When you secure pieces from our drops, their status and express dispatch updates will appear here.
            </p>
            <Link to="/products" className="btn-accent">
              BROWSE CURRENT DROP →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white border-2 border-[#151515] shadow-brutal-sm overflow-hidden transition-all"
                >
                  {/* Order Top Bar */}
                  <div className="p-6 bg-[#ECE8DF] border-b border-[#D6D3CD] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-display font-black text-lg text-[#151515] uppercase tracking-tight">
                          ORDER #{order.id}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs font-mono text-[#787873]">
                        PLACED ON: {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto">
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-[#787873] uppercase">TOTAL AMOUNT</div>
                        <div className="font-display font-black text-xl text-[#151515]">
                          ₹{Number(order.total).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="p-2 border border-[#151515] bg-white hover:bg-[#CCFF00] transition-colors"
                        aria-label="Toggle order details"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="p-6 divide-y divide-[#ECE8DF]">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200'}
                            alt={item.name}
                            className="w-16 h-20 object-cover border border-[#D6D3CD] flex-shrink-0"
                          />
                          <div>
                            <h4 className="font-display font-bold text-sm uppercase text-[#151515]">
                              {item.name}
                            </h4>
                            <p className="text-xs font-mono text-[#787873] mt-0.5">
                              QTY: {item.quantity} • UNIT: ₹{Number(item.price).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        <div className="font-display font-black text-sm text-[#151515]">
                          ₹{Number(item.subtotal || item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expanded Tracking & Shipping Info */}
                  {isExpanded && (
                    <div className="p-6 bg-[#F2EFE8] border-t border-[#D6D3CD] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono animate-fade-in">
                      <div>
                        <h5 className="font-bold uppercase tracking-wider text-[#151515] mb-2 flex items-center gap-1.5">
                          <Truck size={14} />
                          <span>SHIPPING ADDRESS</span>
                        </h5>
                        {order.shipping_address ? (
                          <div className="text-[#4A4A46] leading-relaxed bg-white p-3 border border-[#D6D3CD]">
                            <p className="font-bold text-[#151515]">
                              {order.shipping_address.first_name} {order.shipping_address.last_name}
                            </p>
                            <p>{order.shipping_address.address}</p>
                            <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.zip_code}</p>
                            <p>Phone: {order.shipping_address.phone}</p>
                          </div>
                        ) : (
                          <p className="text-[#787873]">Standard courier dispatch address recorded.</p>
                        )}
                      </div>

                      <div>
                        <h5 className="font-bold uppercase tracking-wider text-[#151515] mb-2 flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>FULFILLMENT TIMELINE</span>
                        </h5>
                        <div className="space-y-2 bg-white p-3 border border-[#D6D3CD]">
                          <div className="flex items-center justify-between text-[#787873]">
                            <span>SUBTOTAL:</span>
                            <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between text-[#787873]">
                            <span>TAX (5% GST):</span>
                            <span>₹{Number(order.tax).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between text-[#787873]">
                            <span>SHIPPING:</span>
                            <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                          </div>
                          <div className="flex items-center justify-between font-bold text-[#151515] pt-1 border-t border-[#ECE8DF]">
                            <span>TOTAL:</span>
                            <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
