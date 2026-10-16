import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const cartTotal = getCartTotal();
  const freeShippingThreshold = 1999;
  const shipping = cartTotal >= freeShippingThreshold || cartTotal === 0 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.05); // 5% apparel GST
  const grandTotal = cartTotal + shipping + tax;
  const progressPercent = Math.min(100, Math.round((cartTotal / freeShippingThreshold) * 100));

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F2EFE8] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white border-2 border-[#151515] p-10 text-center shadow-brutal">
          <div className="w-16 h-16 border-2 border-[#151515] bg-[#CCFF00] flex items-center justify-center mx-auto mb-5 text-[#151515]">
            <ShoppingBag size={30} />
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-[#151515] mb-2">
            YOUR BAG IS EMPTY
          </h2>
          <p className="text-xs font-mono text-[#787873] mb-8 leading-relaxed">
            Your shopping bag does not contain any curated streetwear finds yet. Once an item is gone, it rarely restocks.
          </p>
          <Link to="/products" className="btn-accent w-full block py-4 text-center">
            EXPLORE THE LATEST DROP →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EFE8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#151515] pb-6 mb-8 gap-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-[#787873] uppercase mb-1">
              SHOPPING BAG REVIEW
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#151515]">
              YOUR STREETWEAR BAG ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
            </h1>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#151515] hover:text-[#787873]"
          >
            <ArrowLeft size={14} />
            <span>CONTINUE SHOPPING</span>
          </Link>
        </div>

        {/* Free Shipping Progress Strip */}
        <div className="bg-[#151515] text-[#F2EFE8] p-4 mb-8 border border-[#151515]">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2">
            <span>
              {cartTotal >= freeShippingThreshold ? (
                <span className="text-[#CCFF00] font-bold">⚡ YOU'VE QUALIFIED FOR FREE EXPRESS DISPATCH</span>
              ) : (
                <span>ADD ₹{(freeShippingThreshold - cartTotal).toLocaleString('en-IN')} MORE TO UNLOCK FREE SHIPPING</span>
              )}
            </span>
            <span className="text-[#CCFF00] font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#2A2A2A] h-2">
            <div
              className="bg-[#CCFF00] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Item List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border-2 border-[#151515] divide-y divide-[#D6D3CD]">
              {cartItems.map((item) => (
                <div key={item.product_id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:bg-[#FAF9F6] transition-colors">
                  
                  {/* Thumbnail */}
                  <div className="w-24 h-28 bg-[#ECE8DF] border border-[#D6D3CD] flex-shrink-0 overflow-hidden">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400'}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Title & Specs */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h3 className="font-display font-black text-base uppercase text-[#151515] tracking-tight truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#787873] uppercase">
                      {item.size && (
                        <span className="bg-[#F2EFE8] px-2 py-0.5 border border-[#D6D3CD] text-[#151515] font-bold">
                          SIZE: {item.size}
                        </span>
                      )}
                      {item.condition && (
                        <span>CONDITION: {item.condition}</span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-[#151515] font-bold pt-1">
                      UNIT PRICE: ₹{Number(item.price).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center border border-[#151515] bg-white self-center sm:self-auto">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="p-2 hover:bg-[#F2EFE8] text-[#151515] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 font-mono font-bold text-sm text-[#151515]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="p-2 hover:bg-[#F2EFE8] text-[#151515] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right sm:w-28 self-end sm:self-auto">
                    <p className="font-display font-black text-lg text-[#151515]">
                      ₹{Number(item.subtotal || item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="p-2 text-[#787873] hover:text-red-600 transition-colors self-end sm:self-auto"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={clearCart}
                className="text-xs font-mono text-red-600 hover:underline uppercase tracking-wider font-bold"
              >
                EMPTY ENTIRE BAG
              </button>
              <span className="text-xs font-mono text-[#787873]">
                Prices verified directly with backend inventory.
              </span>
            </div>
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white border-2 border-[#151515] p-6 shadow-brutal space-y-6">
              
              <h2 className="font-display font-black text-xl uppercase tracking-tight text-[#151515] pb-4 border-b border-[#D6D3CD]">
                ORDER SUMMARY
              </h2>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between text-[#787873]">
                  <span>BAG SUBTOTAL</span>
                  <span className="font-bold text-[#151515]">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#787873]">
                  <span>APPAREL GST (5%)</span>
                  <span className="font-bold text-[#151515]">
                    ₹{tax.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#787873]">
                  <span>PAN-INDIA DISPATCH</span>
                  <span className="font-bold text-[#151515]">
                    {shipping === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE EXPRESS</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-display text-base font-black text-[#151515] pt-4 border-t-2 border-[#151515]">
                  <span>TOTAL DUE</span>
                  <span className="text-xl">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full btn-accent py-4 text-sm flex items-center justify-center gap-2 shadow-brutal"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={18} />
              </button>

              {/* Guarantees */}
              <div className="pt-2 border-t border-[#ECE8DF] space-y-2 text-xs font-mono text-[#4A4A46]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#151515]" />
                  <span>100% Verified Thrift Silhouettes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-[#151515]" />
                  <span>Tracked Express Courier Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw size={16} className="text-[#151515]" />
                  <span>Pre-Sanitized & Ready To Wear</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
