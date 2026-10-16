import React, { useState, useEffect } from 'react';

const OrderModal = ({ isOpen, onClose, order, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && order) {
      setFormData({
        status: order.status || 'pending',
        notes: order.notes || ''
      });
    }
  }, [isOpen, order]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onUpdate(order.id, formData);
      onClose();
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order status.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString('en-IN')}`;
  };

  if (!isOpen || !order) return null;

  const addr = order.shipping_address;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white border-2 border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500">
              RAO'S THRIFT FULFILLMENT
            </span>
            <h3 className="text-xl font-bold uppercase tracking-tight text-gray-900 mt-0.5">
              ORDER #{order.id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-500 text-red-700 text-xs font-mono font-bold">
            ⚠️ {error}
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* Customer & Shipping Information */}
          <div className="border border-gray-200 p-4 bg-gray-50">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 mb-3">
              SHIPPING & CUSTOMER DETAILS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="text-gray-500 uppercase">Customer Name</p>
                <p className="font-bold text-gray-900">
                  {addr ? `${addr.first_name} ${addr.last_name}` : (order.user_name || order.user_email || 'Customer')}
                </p>
                <p className="text-gray-500 uppercase mt-2">Contact Phone</p>
                <p className="font-bold text-gray-900">{addr?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase">Delivery Address</p>
                {addr ? (
                  <p className="text-gray-900 font-medium leading-relaxed">
                    {addr.address}<br />
                    {addr.city}, {addr.state} - {addr.zip_code}<br />
                    {addr.country || 'India'}
                  </p>
                ) : (
                  <p className="text-gray-400">Direct pickup / express recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Ordered Streetwear Items */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 mb-3">
              ORDERED STREETWEAR PIECES ({order.items?.length || 0})
            </h4>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200'}
                      alt={item.name}
                      className="w-12 h-14 object-cover border border-gray-300"
                    />
                    <div>
                      <p className="font-bold text-gray-900 uppercase">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity} • Unit: {formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatPrice(item.subtotal || item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-gray-50 p-4 border border-gray-200 text-xs font-mono space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (5% GST):</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping Dispatch:</span>
              <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-gray-300">
              <span>Total Payable:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Update Status Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Update Fulfillment Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-xs font-mono uppercase font-bold"
                required
              >
                <option value="pending">Pending (Order Received)</option>
                <option value="processing">Processing (Preparing at Hub)</option>
                <option value="shipped">Shipped (Dispatched with Courier)</option>
                <option value="delivered">Delivered (Successfully Handed Over)</option>
                <option value="cancelled">Cancelled (Restock piece)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-xs font-mono uppercase font-bold hover:bg-gray-100"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-black text-white hover:bg-gray-800 text-xs font-mono uppercase font-bold"
              >
                {loading ? 'Updating...' : 'Save Status Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
