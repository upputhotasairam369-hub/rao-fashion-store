import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { api, endpoints } from '../api/api';

const Favorites = () => {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const loadFavoriteProducts = async () => {
    if (!isAuthenticated) {
      setFavoriteProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(endpoints.favorites.list);
      setFavoriteProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load favorite products:', error);
      setFavoriteProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavoriteProducts();

    const handleFavoritesUpdate = () => {
      loadFavoriteProducts();
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F2EFE8] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white border-2 border-[#151515] p-10 text-center shadow-brutal">
          <Heart size={32} className="mx-auto text-[#151515] mb-4" />
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-[#151515] mb-2">
            WISHLIST ACCESS
          </h2>
          <p className="text-xs font-mono text-[#787873] mb-6">
            Log in to save rare vintage drops and one-of-one silhouettes to your personal wishlist.
          </p>
          <Link to="/login?redirect=favorites" className="btn-accent w-full block py-3.5 text-center text-xs">
            LOG IN TO VIEW SAVED PIECES →
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
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="border-b-2 border-[#151515] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-[#787873] uppercase mb-1">
              SAVED SILHOUETTES
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#151515]">
              YOUR WISHLIST ({favoriteProducts.length})
            </h1>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#151515] hover:text-[#787873]"
          >
            <span>CONTINUE BROWSING</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="bg-white border-2 border-[#151515] p-16 text-center shadow-brutal max-w-lg mx-auto my-12">
            <Heart size={40} className="mx-auto text-[#787873] mb-4" />
            <h3 className="font-display font-black text-2xl uppercase text-[#151515] mb-2">
              NO SAVED PIECES YET
            </h3>
            <p className="text-xs font-mono text-[#787873] mb-6">
              Click the heart icon on any product card or detail page to bookmark one-of-one finds while you decide.
            </p>
            <Link to="/products" className="btn-accent">
              BROWSE CURRENT DROP →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
