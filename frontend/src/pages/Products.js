import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api, endpoints } from '../api/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || '');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('min_price') || '',
    max: searchParams.get('max_price') || ''
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'newest');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'desc');

  const itemsPerPage = 12;
  const isInternalUpdate = useRef(false);

  // Available filter options
  const sizeOptions = ['S', 'M', 'L', 'XL', 'Oversized XL', '32x32', '34x30', 'One Size'];
  const conditionOptions = ['New With Tags', 'Like New', 'Good', 'Fair'];
  const sortOptions = [
    { label: 'NEWEST DROPS', by: 'newest', order: 'desc' },
    { label: 'PRICE: LOW TO HIGH', by: 'price', order: 'asc' },
    { label: 'PRICE: HIGH TO LOW', by: 'price', order: 'desc' },
    { label: 'TOP RATED', by: 'rating', order: 'desc' },
    { label: 'NAME: A-Z', by: 'name', order: 'asc' },
  ];

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(endpoints.products.categories);
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedSize) params.append('size', selectedSize);
      if (selectedCondition) params.append('condition', selectedCondition);
      if (priceRange.min) params.append('min_price', priceRange.min);
      if (priceRange.max) params.append('max_price', priceRange.max);

      const response = await api.get(`${endpoints.products.list}?${params}`);
      setProducts(response.data.products || []);
      setTotalProducts(response.data.total || 0);

      // Keep URL params in sync
      const currentParams = new URLSearchParams(searchParams);
      if (currentParams.toString() !== params.toString()) {
        isInternalUpdate.current = true;
        setSearchParams(params, { replace: true });
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, selectedSize, selectedCondition, priceRange, sortBy, sortOrder, searchParams, setSearchParams]);

  // Sync state with URL params
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlSize = searchParams.get('size') || '';
    const urlCondition = searchParams.get('condition') || '';
    const urlMinPrice = searchParams.get('min_price') || '';
    const urlMaxPrice = searchParams.get('max_price') || '';
    const urlSortBy = searchParams.get('sort_by') || 'newest';
    const urlSortOrder = searchParams.get('sort_order') || 'desc';
    const urlPage = parseInt(searchParams.get('page') || '1');

    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
    if (urlSize !== selectedSize) setSelectedSize(urlSize);
    if (urlCondition !== selectedCondition) setSelectedCondition(urlCondition);
    if (urlMinPrice !== priceRange.min || urlMaxPrice !== priceRange.max) {
      setPriceRange({ min: urlMinPrice, max: urlMaxPrice });
    }
    if (urlSortBy !== sortBy) setSortBy(urlSortBy);
    if (urlSortOrder !== sortOrder) setSortOrder(urlSortOrder);
    if (urlPage !== currentPage) setCurrentPage(urlPage);
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSize('');
    setSelectedCondition('');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const activeFilterCount = [
    searchQuery,
    selectedCategory,
    selectedSize,
    selectedCondition,
    priceRange.min,
    priceRange.max
  ].filter(Boolean).length;

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  return (
    <div className="bg-[#F2EFE8] text-[#151515] min-h-screen pb-20">
      
      {/* Top Banner / Breadcrumb */}
      <div className="border-b-2 border-[#151515] bg-[#ECE8DF] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono tracking-widest text-[#787873] uppercase mb-1">
              <span>CATALOG</span>
              <span>/</span>
              <span className="text-[#151515] font-bold">
                {selectedCategory ? selectedCategory.toUpperCase() : 'ALL STREETWEAR'}
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#151515]">
              {selectedCategory || 'SHOP ALL PIECES'}
            </h1>
          </div>
          <div className="text-xs font-mono tracking-wider text-[#151515] bg-white px-3 py-1.5 border border-[#D6D3CD] self-start md:self-auto">
            SHOWING <span className="font-black text-[#151515]">{products.length}</span> OF <span className="font-black text-[#151515]">{totalProducts}</span> ONE-OF-ONE DROPS
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search & Filter Toolbar */}
        <div className="bg-white border-2 border-[#151515] p-4 mb-8 shadow-brutal-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="SEARCH DROPS, BANDS, DENIM, SILHOUETTES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#F2EFE8] text-xs font-mono border border-[#D6D3CD] focus:outline-none focus:border-[#151515]"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787873]" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787873] hover:text-[#151515]"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Quick Category Tabs (Desktop) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            <button
              onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-[#151515] text-[#CCFF00] border-[#151515]'
                  : 'bg-white text-[#787873] border-[#D6D3CD] hover:border-[#151515] hover:text-[#151515]'
              }`}
            >
              ALL
            </button>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border whitespace-nowrap transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-[#151515] text-[#CCFF00] border-[#151515]'
                    : 'bg-white text-[#787873] border-[#D6D3CD] hover:border-[#151515] hover:text-[#151515]'
                }`}
              >
                {cat.name.replace('&', '+')}
              </button>
            ))}
          </div>

          {/* Sort Dropdown & Filter Toggle Button */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by);
                  setSortOrder(order);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-[#F2EFE8] text-xs font-mono font-bold tracking-wider uppercase border border-[#D6D3CD] py-2.5 pl-3 pr-8 focus:outline-none focus:border-[#151515]"
              >
                {sortOptions.map((opt) => (
                  <option key={`${opt.by}-${opt.order}`} value={`${opt.by}-${opt.order}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#787873]" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-primary py-2.5 px-4 text-xs flex items-center space-x-1.5 ${
                showFilters || activeFilterCount > 0 ? 'bg-[#CCFF00] text-[#151515] border-[#151515]' : ''
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>FILTERS</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#151515] text-[#CCFF00] text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filter Drawer / Panel */}
        {showFilters && (
          <div className="bg-white border-2 border-[#151515] p-6 mb-8 shadow-brutal animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#D6D3CD] mb-6">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#151515] flex items-center gap-2">
                <Filter size={16} />
                <span>FILTER SPECIFICATIONS</span>
              </h3>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearAllFilters}
                    className="text-xs font-mono text-red-600 hover:underline uppercase"
                  >
                    RESET ALL FILTERS
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 text-[#151515] hover:bg-[#F2EFE8]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Category Filter */}
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#151515] mb-3">
                  CATEGORIES
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
                    className={`block w-full text-left px-2 py-1 text-xs font-mono uppercase ${
                      !selectedCategory ? 'bg-[#151515] text-[#CCFF00] font-bold' : 'text-[#787873] hover:text-[#151515]'
                    }`}
                  >
                    ALL CATEGORIES
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCategory(c.name); setCurrentPage(1); }}
                      className={`block w-full text-left px-2 py-1 text-xs font-mono uppercase ${
                        selectedCategory === c.name ? 'bg-[#151515] text-[#CCFF00] font-bold' : 'text-[#787873] hover:text-[#151515]'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#151515] mb-3">
                  FIT & SIZE
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setSelectedSize(''); setCurrentPage(1); }}
                    className={`px-2.5 py-1 text-[11px] font-mono border uppercase ${
                      !selectedSize ? 'bg-[#151515] text-[#CCFF00] border-[#151515] font-bold' : 'bg-white text-[#787873] border-[#D6D3CD]'
                    }`}
                  >
                    ANY
                  </button>
                  {sizeOptions.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => { setSelectedSize(sz); setCurrentPage(1); }}
                      className={`px-2.5 py-1 text-[11px] font-mono border uppercase ${
                        selectedSize === sz ? 'bg-[#151515] text-[#CCFF00] border-[#151515] font-bold' : 'bg-white text-[#787873] border-[#D6D3CD] hover:border-[#151515]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Filter */}
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#151515] mb-3">
                  THRIFT CONDITION
                </h4>
                <div className="space-y-1.5">
                  <button
                    onClick={() => { setSelectedCondition(''); setCurrentPage(1); }}
                    className={`block w-full text-left px-2 py-1 text-xs font-mono uppercase ${
                      !selectedCondition ? 'bg-[#151515] text-[#CCFF00] font-bold' : 'text-[#787873] hover:text-[#151515]'
                    }`}
                  >
                    ALL CONDITIONS
                  </button>
                  {conditionOptions.map((cond) => (
                    <button
                      key={cond}
                      onClick={() => { setSelectedCondition(cond); setCurrentPage(1); }}
                      className={`block w-full text-left px-2 py-1 text-xs font-mono uppercase ${
                        selectedCondition === cond ? 'bg-[#151515] text-[#CCFF00] font-bold' : 'text-[#787873] hover:text-[#151515]'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter (INR) */}
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#151515] mb-3">
                  PRICE IN ₹ (INR)
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="MIN ₹"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#F2EFE8] border border-[#D6D3CD] focus:outline-none focus:border-[#151515]"
                  />
                  <span className="text-[#787873]">—</span>
                  <input
                    type="number"
                    placeholder="MAX ₹"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#F2EFE8] border border-[#D6D3CD] focus:outline-none focus:border-[#151515]"
                  />
                </div>
                <button
                  onClick={() => { setCurrentPage(1); loadProducts(); }}
                  className="w-full btn-primary py-2 text-[10px]"
                >
                  APPLY PRICE FILTER
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-mono">
            <span className="text-[#787873]">ACTIVE FILTERS:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#151515] text-[#F2EFE8] border border-[#151515]">
                <span>CATEGORY: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory('')}><X size={12} /></button>
              </span>
            )}
            {selectedSize && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#151515] text-[#F2EFE8] border border-[#151515]">
                <span>SIZE: {selectedSize}</span>
                <button onClick={() => setSelectedSize('')}><X size={12} /></button>
              </span>
            )}
            {selectedCondition && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#151515] text-[#F2EFE8] border border-[#151515]">
                <span>CONDITION: {selectedCondition}</span>
                <button onClick={() => setSelectedCondition('')}><X size={12} /></button>
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#151515] text-[#F2EFE8] border border-[#151515]">
                <span>PRICE: ₹{priceRange.min || '0'} - ₹{priceRange.max || 'MAX'}</span>
                <button onClick={() => setPriceRange({ min: '', max: '' })}><X size={12} /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#151515] text-[#F2EFE8] border border-[#151515]">
                <span>SEARCH: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')}><X size={12} /></button>
              </span>
            )}
            <button
              onClick={handleClearAllFilters}
              className="text-xs font-bold text-red-600 hover:underline uppercase ml-2"
            >
              CLEAR ALL
            </button>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white border border-[#D6D3CD] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border-2 border-[#151515] p-16 text-center shadow-brutal my-10 max-w-xl mx-auto">
            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-[#151515] mb-2">
              NO PIECES MATCH YOUR FILTERS
            </h3>
            <p className="text-xs font-mono text-[#787873] mb-6">
              Try adjusting your category, size, condition or search query. Many of our items are rare one-of-one pieces that sell out rapidly.
            </p>
            <button
              onClick={handleClearAllFilters}
              className="btn-accent"
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-14 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 border border-[#151515] bg-white text-[#151515] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#CCFF00] transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 font-mono text-xs font-bold border transition-colors ${
                    currentPage === pageNum
                      ? 'bg-[#151515] text-[#CCFF00] border-[#151515]'
                      : 'bg-white text-[#151515] border-[#D6D3CD] hover:border-[#151515]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 border border-[#151515] bg-white text-[#151515] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#CCFF00] transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
