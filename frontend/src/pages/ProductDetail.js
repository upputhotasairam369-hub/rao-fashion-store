import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowLeft, Ruler, AlertCircle, ShieldCheck, Truck, RefreshCw, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api, endpoints } from '../api/api';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.products.detail(id));
      const p = response.data;
      setProduct(p);

      // Fetch related products from same category
      if (p.category) {
        try {
          const relRes = await api.get(`${endpoints.products.list}?category=${encodeURIComponent(p.category)}&limit=4`);
          setRelatedProducts((relRes.data.products || []).filter(item => item.id !== p.id));
        } catch (e) {
          console.warn('Could not load related products');
        }
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadProduct]);

  useEffect(() => {
    if (!id || !isAuthenticated) {
      setIsFavorited(false);
      return;
    }

    const checkFavorite = async () => {
      try {
        const response = await api.get(endpoints.favorites.check(id));
        setIsFavorited(response.data.is_favorited);
      } catch (error) {
        setIsFavorited(false);
      }
    };

    checkFavorite();
  }, [id, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        await api.delete(endpoints.favorites.remove(id));
        setIsFavorited(false);
      } else {
        await api.post(endpoints.favorites.add(id));
        setIsFavorited(true);
      }
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;

    setAddingToCart(true);
    try {
      await addToCart(product, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#F2EFE8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#151515] border-t-[#CCFF00] rounded-full animate-spin" />
      </div>
    );
  }

  const isSoldOut = Number(product.stock) <= 0;
  const isOneOfOne = Number(product.stock) === 1;

  const conditionDescription = {
    'new with tags': 'Deadstock vintage or brand new condition with original retail tags attached. Never worn or washed.',
    'like new': 'Near pristine pre-owned condition with zero visible marks, fading, or distress.',
    'good': 'Authentic vintage wear with natural character, gentle wash patina, or light distressing as described below.',
    'fair': 'Noticeable vintage wear, repairs, or minor flaws clearly itemized below. Full of character.'
  };

  const conditionDesc = conditionDescription[product.condition?.toLowerCase()] || 'Authentic pre-owned thrift condition.';

  return (
    <div className="bg-[#F2EFE8] text-[#151515] min-h-screen pb-24">
      
      {/* Breadcrumb Bar */}
      <div className="border-b border-[#D6D3CD] bg-[#ECE8DF] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[#787873] hover:text-[#151515] uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={14} />
            <span>BACK TO DROPS</span>
          </button>
          <div className="flex items-center gap-2 text-[#787873] uppercase tracking-wider">
            <Link to="/" className="hover:text-[#151515]">HOME</Link>
            <span>/</span>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#151515]">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-[#151515] font-bold truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Product Imagery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] bg-white border-2 border-[#151515] shadow-brutal overflow-hidden">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000'}
                alt={product.name}
                className={`w-full h-full object-cover object-center ${isSoldOut ? 'opacity-50 grayscale' : ''}`}
              />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.condition && (
                  <span className="px-3 py-1 bg-[#151515] text-[#CCFF00] font-mono text-xs font-black uppercase tracking-widest border border-[#CCFF00]">
                    {product.condition}
                  </span>
                )}
                {isOneOfOne && !isSoldOut && (
                  <span className="px-3 py-1 bg-[#CCFF00] text-[#151515] font-mono text-xs font-black uppercase tracking-widest border border-[#151515]">
                    ONE-OF-ONE PIECE
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 p-3 bg-white border-2 border-[#151515] hover:bg-[#CCFF00] transition-colors shadow-brutal-sm"
                aria-label="Wishlist toggle"
              >
                <Heart
                  size={20}
                  className={isFavorited ? 'fill-[#151515] text-[#151515]' : 'text-[#151515]'}
                />
              </button>

              {/* Sold Out Banner */}
              {isSoldOut && (
                <div className="absolute inset-0 bg-[#151515]/70 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-[#151515] text-[#CCFF00] border-2 border-[#CCFF00] px-6 py-3 font-display font-black text-xl tracking-widest uppercase">
                    SOLD OUT • ARCHIVED
                  </div>
                </div>
              )}
            </div>

            {/* Thrift Transparency Notice */}
            <div className="bg-white border border-[#D6D3CD] p-4 flex items-start gap-3">
              <ShieldCheck size={20} className="text-[#151515] flex-shrink-0 mt-0.5" />
              <div className="text-xs font-mono text-[#4A4A46] leading-relaxed">
                <span className="font-bold text-[#151515] uppercase">ARCHIVAL AUTHENTICITY:</span> Every piece is individually inspected, steam-sanitized, and measured laying flat. Colors may vary slightly under natural daylight.
              </div>
            </div>
          </div>

          {/* Right: Product Details & Buying Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            
            <div className="space-y-6">
              
              {/* Category & Single Stock Alert */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono tracking-mega text-[#787873] uppercase font-bold">
                  {product.category}
                </span>
                {isSoldOut ? (
                  <span className="text-xs font-mono font-bold text-red-600 uppercase">
                    OUT OF STOCK
                  </span>
                ) : isOneOfOne ? (
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-300 uppercase">
                    ONLY 1 IN STOCK
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-[#151515] uppercase">
                    {product.stock} PIECES AVAILABLE
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#151515] leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="font-display font-black text-3xl text-[#151515]">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-mono text-[#787873] uppercase">
                    INR (INCL. APPAREL TAXES)
                  </span>
                </div>
              </div>

              {/* Size Specification */}
              <div className="border-t border-b border-[#D6D3CD] py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#151515]">
                    TAGGED FIT / SIZE:
                  </span>
                  <span className="text-xs font-mono text-[#787873]">LAID FLAT MEASUREMENTS BELOW</span>
                </div>
                <div className="inline-block px-4 py-2 bg-[#151515] text-[#CCFF00] font-mono text-sm font-black uppercase tracking-widest border border-[#151515]">
                  {product.size || 'ONE SIZE'}
                </div>
              </div>

              {/* Thrift Condition Specification Box */}
              <div className="bg-white border-2 border-[#151515] p-4 shadow-brutal-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[#ECE8DF]">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#151515] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#CCFF00]" />
                    CONDITION: {product.condition?.toUpperCase() || 'GOOD'}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#787873] mt-2.5 leading-relaxed">
                  {conditionDesc}
                </p>
              </div>

              {/* Garment Measurements Box */}
              <div className="bg-[#ECE8DF] border border-[#D6D3CD] p-4">
                <div className="flex items-center gap-2 mb-2 font-display font-bold text-xs uppercase tracking-wider text-[#151515]">
                  <Ruler size={16} />
                  <span>EXACT GARMENT MEASUREMENTS</span>
                </div>
                <p className="text-xs font-mono text-[#151515] font-semibold bg-white p-2.5 border border-[#D6D3CD]">
                  {product.measurements || 'Chest: 24", Length: 29", Shoulder: 21" (Fits relaxed Oversized)'}
                </p>
                <p className="text-[10px] font-mono text-[#787873] mt-1.5">
                  Pro-tip: Compare these measurements against your favorite fitting tee/hoodie at home.
                </p>
              </div>

              {/* Visible Flaws / Distress Declaration */}
              <div className="bg-white border border-[#D6D3CD] p-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#151515] mb-1.5">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span>FLAWS & CHARACTER DISCLOSURE</span>
                </div>
                <p className="text-xs font-mono text-[#4A4A46]">
                  {product.flaws && product.flaws.trim() ? product.flaws : 'None. Pristine archival preservation.'}
                </p>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#151515] mb-2">
                  CURATOR'S NOTES
                </h4>
                <p className="text-xs sm:text-sm font-mono text-[#4A4A46] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Add to Bag Actions */}
              <div className="pt-2 space-y-3">
                {isSoldOut ? (
                  <button
                    disabled
                    className="w-full py-4 bg-[#787873] text-[#F2EFE8] font-display font-black text-sm uppercase tracking-widest cursor-not-allowed opacity-75 border-2 border-[#787873]"
                  >
                    SOLD OUT — CANNOT PURCHASE
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* Quantity Picker if stock > 1 */}
                    {product.stock > 1 && (
                      <div className="flex items-center border-2 border-[#151515] bg-white h-14">
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="px-3.5 h-full text-base font-bold hover:bg-[#F2EFE8]"
                        >
                          -
                        </button>
                        <span className="px-3 font-mono font-bold text-sm">{quantity}</span>
                        <button
                          onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                          className="px-3.5 h-full text-base font-bold hover:bg-[#F2EFE8]"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="flex-1 btn-accent py-4 text-sm flex items-center justify-center gap-2 shadow-brutal"
                    >
                      {addedSuccess ? (
                        <>
                          <Check size={18} />
                          <span>ADDED TO BAG</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={18} />
                          <span>{addingToCart ? 'ADDING...' : 'ADD TO SHOPPING BAG'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Delivery Guarantees */}
              <div className="border-t border-[#D6D3CD] pt-6 space-y-3 text-xs font-mono text-[#4A4A46]">
                <div className="flex items-center gap-3">
                  <Truck size={16} className="text-[#151515]" />
                  <span>Pan-India express shipping • Free over ₹1,999</span>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw size={16} className="text-[#151515]" />
                  <span>Pre-washed, steam-treated, and sanitized prior to shipping</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Related Drops Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t-2 border-[#151515]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-mono text-[#787873] uppercase tracking-widest">
                  SIMILAR SILHOUETTES
                </p>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-[#151515]">
                  MORE FROM {product.category.toUpperCase()}
                </h3>
              </div>
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-mono font-bold text-[#151515] hover:text-[#CCFF00] hover:bg-[#151515] px-3 py-1.5 border border-[#151515] uppercase tracking-wider transition-colors"
              >
                VIEW CATEGORY →
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
