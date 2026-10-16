import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartDrawer = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, isDrawerOpen, setIsDrawerOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const cartTotal = getCartTotal();
  const freeShippingThreshold = 1999;
  const shipping = cartTotal >= freeShippingThreshold || cartTotal === 0 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.05); // 5% GST
  const grandTotal = cartTotal + shipping + tax;
  const progressPercent = Math.min(100, Math.round((cartTotal / freeShippingThreshold) * 100));

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#151515]/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F2EFE8] border-l-2 border-[#151515] flex flex-col justify-between shadow-2xl animate-slide-up">
          
          {/* Header */}
          <div className="p-5 border-b border-[#D6D3CD] bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag size={20} className="text-[#151515]" />
              <h2 className="font-display font-black text-lg tracking-tight uppercase text-[#151515]">
                YOUR BAG ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 text-[#151515] hover:bg-[#F2EFE8] transition-colors"
              aria-label="Close bag"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#151515] text-[#F2EFE8] px-5 py-3">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase mb-1.5">
              <span>
                {cartTotal >= freeShippingThreshold
                  ? '⚡ YOU UNLOCKED FREE EXPRESS SHIPPING'
                  : `ADD ₹${(freeShippingThreshold - cartTotal).toLocaleString('en-IN')} FOR FREE SHIPPING`}
              </span>
              <span className="text-[#CCFF00] font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#2A2A2A] h-1.5 overflow-hidden">
              <div
                className="bg-[#CCFF00] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 border-2 border-[#D6D3CD] flex items-center justify-center text-[#787873] mb-4">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="font-display font-bold text-lg text-[#151515] uppercase tracking-tight">
                  YOUR BAG IS EMPTY
                </h3>
                <p className="text-xs font-mono text-[#787873] mt-1 mb-6 max-w-xs">
                  Discover rare vintage drops and one-of-one urban streetwear finds before they're gone.
                </p>
                <button
                  onClick={() => { setIsDrawerOpen(false); navigate('/products'); }}
                  className="btn-primary"
                >
                  EXPLORE THE DROP →
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product_id}
                  className="bg-white border border-[#D6D3CD] p-3 flex gap-3 relative hover:border-[#151515] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-[#ECE8DF] overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400'}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-display font-bold text-xs uppercase text-[#151515] line-clamp-1 pr-4">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-[#787873] hover:text-red-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Size & Condition Tags */}
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[#787873] uppercase">
                        {item.size && (
                          <span className="bg-[#F2EFE8] px-1.5 py-0.5 border border-[#D6D3CD] text-[#151515] font-bold">
                            {item.size}
                          </span>
                        )}
                        {item.condition && (
                          <span>{item.condition}</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F2EFE8]">
                      <div className="flex items-center border border-[#D6D3CD]">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 hover:bg-[#F2EFE8] text-[#151515] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 font-mono text-xs font-bold text-[#151515]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 hover:bg-[#F2EFE8] text-[#151515] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="font-display font-black text-sm text-[#151515]">
                        ₹{Number(item.subtotal || item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t-2 border-[#151515] bg-white space-y-3">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#787873]">
                  <span>SUBTOTAL</span>
                  <span className="font-bold text-[#151515]">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#787873]">
                  <span>ESTIMATED GST (5%)</span>
                  <span className="font-bold text-[#151515]">
                    ₹{tax.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#787873]">
                  <span>SHIPPING</span>
                  <span className="font-bold text-[#151515]">
                    {shipping === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between font-display text-sm font-black text-[#151515] pt-2 border-t border-[#D6D3CD]">
                  <span>TOTAL PAYABLE</span>
                  <span className="text-base text-[#151515]">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout & View Cart buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCheckout}
                  className="w-full btn-accent py-3.5 flex items-center justify-center gap-2"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight size={16} />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/cart"
                    onClick={() => setIsDrawerOpen(false)}
                    className="btn-secondary text-center py-2 text-[11px]"
                  >
                    VIEW FULL BAG
                  </Link>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="btn-secondary text-center py-2 text-[11px]"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-center gap-4 text-[10px] font-mono text-[#787873]">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} /> AUTHENTIC THRIFT
                </span>
                <span className="flex items-center gap-1">
                  <Truck size={12} /> PAN-INDIA DISPATCH
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
