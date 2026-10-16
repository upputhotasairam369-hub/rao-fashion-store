import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api, endpoints } from '../api/api';
import { ShieldCheck, Truck, CheckCircle, ArrowLeft, CreditCard, Banknote, QrCode } from 'lucide-react';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || user?.first_name || '',
    lastName: user?.name?.split(' ')[1] || user?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const cartTotal = getCartTotal();
  const freeShippingThreshold = 1999;
  const shipping = cartTotal >= freeShippingThreshold || cartTotal === 0 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.05);
  const total = cartTotal + shipping + tax;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
      return;
    }

    if (!formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.phone) {
      setError('Please fill in all required shipping address fields.');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        shipping_address: {
          first_name: formData.firstName || 'Customer',
          last_name: formData.lastName || 'Order',
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: 'India',
          phone: formData.phone
        },
        payment_method: paymentMethod,
        items: cartItems.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.price
        }))
      };

      const response = await api.post(endpoints.orders.create, orderPayload);
      const createdOrder = response.data;
      await clearCart();
      setOrderSuccess(createdOrder);
    } catch (err) {
      console.error('Order creation failed:', err);
      const msg = err.response?.data?.detail || 'Failed to place order. Please review your cart and details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // If order was successfully created, show celebratory order confirmation
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#F2EFE8] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white border-2 border-[#151515] p-8 sm:p-12 shadow-brutal text-center animate-fade-in">
          <div className="w-16 h-16 bg-[#CCFF00] border-2 border-[#151515] text-[#151515] flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>

          <span className="px-3 py-1 bg-[#151515] text-[#CCFF00] font-mono text-xs uppercase tracking-widest border border-[#CCFF00]">
            ORDER CONFIRMED • ID: {orderSuccess.id}
          </span>

          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#151515] mt-4 mb-3">
            YOUR FIT IS SECURED.
          </h1>

          <p className="text-xs sm:text-sm font-mono text-[#787873] max-w-md mx-auto mb-8 leading-relaxed">
            Thank you for shopping at RAO'S THRIFT. Your order has been placed successfully and the single-unit stock has been decremented.
          </p>

          {/* Order Summary Snapshot */}
          <div className="bg-[#F2EFE8] border border-[#D6D3CD] p-6 text-left mb-8 space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-[#D6D3CD] pb-2">
              <span className="text-[#787873]">ORDER STATUS:</span>
              <span className="font-black text-[#151515] uppercase">{orderSuccess.status || 'PENDING'}</span>
            </div>
            <div className="flex justify-between border-b border-[#D6D3CD] py-2">
              <span className="text-[#787873]">PAYMENT METHOD:</span>
              <span className="font-black text-[#151515] uppercase">
                {paymentMethod === 'cod' ? 'CASH ON DELIVERY (COD)' : 'UPI / QR SCAN'}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#D6D3CD] py-2">
              <span className="text-[#787873]">DELIVERING TO:</span>
              <span className="font-bold text-[#151515] truncate max-w-xs">
                {formData.address}, {formData.city}, {formData.state} - {formData.zipCode}
              </span>
            </div>
            <div className="flex justify-between pt-2 font-display text-sm font-black text-[#151515]">
              <span>TOTAL PAYABLE:</span>
              <span>₹{(orderSuccess.total || total).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/orders"
              className="w-full sm:w-auto btn-primary py-3.5 px-6 text-xs"
            >
              TRACK YOUR ORDERS →
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto btn-secondary py-3.5 px-6 text-xs"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F2EFE8] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white border-2 border-[#151515] p-10 text-center shadow-brutal">
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-[#151515] mb-2">
            YOUR BAG IS EMPTY
          </h2>
          <p className="text-xs font-mono text-[#787873] mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link to="/products" className="btn-accent w-full block py-3.5 text-center text-xs">
            BROWSE CURATED PIECES →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EFE8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="border-b-2 border-[#151515] pb-6 mb-8 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono tracking-widest text-[#787873] uppercase mb-1">
              STEP 2 OF 2 • SECURE ORDER CHECKOUT
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#151515]">
              CHECKOUT
            </h1>
          </div>
          <Link
            to="/cart"
            className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#151515] hover:text-[#787873]"
          >
            <ArrowLeft size={14} />
            <span>RETURN TO BAG</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-600 text-red-800 p-4 mb-8 text-xs font-mono font-bold flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="underline">DISMISS</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Shipping and Payment Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-6">
              
              {/* Shipping Address Box */}
              <div className="bg-white border-2 border-[#151515] p-6 shadow-brutal-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#D6D3CD]">
                  <h2 className="font-display font-black text-lg uppercase tracking-tight text-[#151515] flex items-center gap-2">
                    <Truck size={18} />
                    <span>1. SHIPPING DESTINATION</span>
                  </h2>
                  <span className="text-[11px] font-mono text-[#787873]">ALL-INDIA DELIVERY</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      placeholder="e.g. Sairam"
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
                      placeholder="e.g. Rao"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="you@domain.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                      CONTACT PHONE *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                    STREET ADDRESS & LANDMARK *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Flat/House No., Building, Street Name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                      CITY *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                      STATE *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#151515] mb-1">
                      PIN CODE *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="400001"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white border-2 border-[#151515] p-6 shadow-brutal-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#D6D3CD]">
                  <h2 className="font-display font-black text-lg uppercase tracking-tight text-[#151515] flex items-center gap-2">
                    <CreditCard size={18} />
                    <span>2. PAYMENT METHOD</span>
                  </h2>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">VERIFIED CHECKOUT</span>
                </div>

                <div className="space-y-3">
                  {/* COD Option */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#151515] bg-[#F2EFE8]'
                        : 'border-[#D6D3CD] hover:border-[#151515]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote size={18} className="text-[#151515]" />
                        <span className="font-display font-black text-sm uppercase text-[#151515]">
                          CASH ON DELIVERY (COD) / PAY ON ARRIVAL
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#787873] mt-1 leading-relaxed">
                        Pay cash or UPI directly to courier upon physical arrival of your order. No advance card info required.
                      </p>
                    </div>
                  </label>

                  {/* UPI / QR Option */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#151515] bg-[#F2EFE8]'
                        : 'border-[#D6D3CD] hover:border-[#151515]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <QrCode size={18} className="text-[#151515]" />
                        <span className="font-display font-black text-sm uppercase text-[#151515]">
                          UPI INSTANT QR / NETBANKING (MVP CONFIRMATION)
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#787873] mt-1 leading-relaxed">
                        Place order now; store dispatch team will provide dedicated UPI handle / QR code confirmation.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-accent py-4 text-sm flex items-center justify-center gap-2 shadow-brutal"
              >
                <span>{loading ? 'SECURING YOUR ORDER...' : `PLACE ORDER (₹${total.toLocaleString('en-IN')})`}</span>
              </button>
            </form>
          </div>

          {/* Right: Order Summary Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border-2 border-[#151515] p-6 shadow-brutal space-y-4">
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-[#151515] pb-3 border-b border-[#D6D3CD]">
                BAG SUMMARY ({cartItems.length} ITEMS)
              </h2>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#ECE8DF] pr-1">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="py-3 flex items-center gap-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200'}
                      alt={item.name}
                      className="w-14 h-16 object-cover border border-[#D6D3CD] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-xs uppercase text-[#151515] truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] font-mono text-[#787873] uppercase">
                        QTY: {item.quantity} • {item.size ? `SIZE: ${item.size}` : ''}
                      </p>
                    </div>
                    <div className="font-display font-black text-sm text-[#151515]">
                      ₹{Number(item.subtotal || item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="border-t-2 border-[#151515] pt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#787873]">
                  <span>SUBTOTAL</span>
                  <span className="font-bold text-[#151515]">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#787873]">
                  <span>APPAREL GST (5%)</span>
                  <span className="font-bold text-[#151515]">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#787873]">
                  <span>SHIPPING</span>
                  <span className="font-bold text-[#151515]">
                    {shipping === 0 ? <span className="text-emerald-700">FREE</span> : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between font-display text-base font-black text-[#151515] pt-3 border-t border-[#D6D3CD]">
                  <span>TOTAL TO PAY</span>
                  <span className="text-xl">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] font-mono text-[#787873] border-t border-[#ECE8DF]">
                <ShieldCheck size={14} className="inline mr-1 text-[#151515]" />
                Single-unit pieces decremented in database atomically to guarantee no double-selling.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
