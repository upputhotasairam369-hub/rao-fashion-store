import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api, endpoints } from '../api/api';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsFavorited(false);
      return;
    }

    let isMounted = true;
    const checkFavorite = async () => {
      try {
        const response = await api.get(endpoints.favorites.check(product.id));
        if (isMounted) setIsFavorited(response.data.is_favorited);
      } catch (error) {
        if (isMounted) setIsFavorited(false);
      }
    };

    checkFavorite();
    return () => { isMounted = false; };
  }, [product.id, isAuthenticated]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      if (isFavorited) {
        await api.delete(endpoints.favorites.remove(product.id));
        setIsFavorited(false);
      } else {
        await api.post(endpoints.favorites.add(product.id));
        setIsFavorited(true);
      }
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    setIsAdding(true);
    try {
      await addToCart(product, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const isSoldOut = Number(product.stock) <= 0;
  const isOneOfOne = Number(product.stock) === 1;

  const conditionColor = (cond) => {
    switch (cond?.toLowerCase()) {
      case 'new with tags':
        return 'bg-[#CCFF00] text-[#151515] border-[#151515] font-black';
      case 'like new':
        return 'bg-white text-[#151515] border-[#151515]';
      case 'good':
        return 'bg-[#F2EFE8] text-[#151515] border-[#787873]';
      case 'fair':
        return 'bg-[#ECE8DF] text-[#787873] border-[#D6D3CD]';
      default:
        return 'bg-[#F2EFE8] text-[#151515] border-[#D6D3CD]';
    }
  };

  return (
    <div className="group relative bg-white border border-[#D6D3CD] flex flex-col justify-between transition-all duration-300 hover:border-[#151515] hover:shadow-brutal-sm">
      {/* Top Image Container */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden aspect-[4/5] bg-[#ECE8DF]">
        {/* Skeleton placeholder while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#ECE8DF] animate-pulse"></div>
        )}

        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800'}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
            isSoldOut ? 'opacity-40 grayscale' : 'opacity-100'
          }`}
          loading="lazy"
        />

        {/* Condition & Stock Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1 z-10">
          {product.condition && (
            <span className={`px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase border ${conditionColor(product.condition)}`}>
              {product.condition}
            </span>
          )}
          {isOneOfOne && !isSoldOut && (
            <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-[#151515] text-[#CCFF00] border border-[#151515] font-bold">
              1-OF-1 PIECE
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2.5 right-2.5 p-2 bg-white/90 border border-[#D6D3CD] hover:border-[#151515] hover:bg-[#CCFF00] transition-all z-10"
          title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart
            size={16}
            className={isFavorited ? 'fill-[#151515] text-[#151515]' : 'text-[#151515]'}
          />
        </button>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#151515]/60 z-10 backdrop-blur-[1px]">
            <span className="px-4 py-2 bg-[#151515] text-[#CCFF00] font-display font-black text-sm tracking-widest uppercase border-2 border-[#CCFF00]">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Hover Action Bar */}
        {!isSoldOut && (
          <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-[#151515]/80 via-[#151515]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 py-2.5 px-3 bg-[#151515] text-[#F2EFE8] hover:bg-[#CCFF00] hover:text-[#151515] font-display text-[11px] font-bold tracking-widest uppercase border border-[#151515] transition-all flex items-center justify-center gap-1.5"
            >
              {justAdded ? (
                <>
                  <Check size={14} className="text-[#CCFF00]" />
                  <span>ADDED</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  <span>{isAdding ? 'ADDING...' : 'ADD TO BAG'}</span>
                </>
              )}
            </button>
            <Link
              to={`/products/${product.id}`}
              className="p-2.5 bg-white text-[#151515] hover:bg-[#CCFF00] transition-colors border border-white"
              title="Quick view"
            >
              <Eye size={15} />
            </Link>
          </div>
        )}
      </Link>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col justify-between flex-grow border-t border-[#D6D3CD]">
        <div>
          {/* Category & Size */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#787873] uppercase mb-1.5">
            <span className="truncate mr-2">{product.category}</span>
            <span className="font-bold text-[#151515] bg-[#F2EFE8] px-1.5 py-0.5 border border-[#D6D3CD]">
              SIZE: {product.size || 'ONE SIZE'}
            </span>
          </div>

          {/* Product Title */}
          <Link
            to={`/products/${product.id}`}
            className="block font-display font-bold text-sm tracking-tight text-[#151515] hover:text-[#787873] line-clamp-1 uppercase transition-colors"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Stock info */}
        <div className="flex items-baseline justify-between mt-3 pt-2.5 border-t border-[#ECE8DF]">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-black text-base text-[#151515]">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-mono text-[#787873] uppercase">
              INR
            </span>
          </div>

          <div className="text-[10px] font-mono uppercase">
            {isSoldOut ? (
              <span className="text-red-600 font-bold">SOLD OUT</span>
            ) : product.stock <= 3 ? (
              <span className="text-[#151515] font-bold">
                {product.stock} LEFT
              </span>
            ) : (
              <span className="text-emerald-700 font-bold">IN STOCK</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
