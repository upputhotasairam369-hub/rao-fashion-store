import React, { useState, useEffect } from 'react';
import ProductModal from '../components/ProductModal';
import { api, endpoints } from '../api/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(endpoints.admin.products.list, {
        params: { page: 1, limit: 1000 }
      });
      setProducts(response.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await api.put(endpoints.admin.products.update(editingProduct.id), productData);
      } else {
        await api.post(endpoints.admin.products.create, productData);
      }
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      throw err;
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm(`Are you sure you want to permanently remove product ${productId}?`)) {
      try {
        await api.delete(endpoints.admin.products.delete(productId));
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Error deleting product');
      }
    }
  };

  // Filter products by tab and search
  const filteredProducts = products.filter((p) => {
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    if (!matchesSearch) return false;

    if (filterTab === 'featured') return Boolean(p.is_featured);
    if (filterTab === 'sold_out') return Number(p.stock) === 0;
    if (filterTab === 'low_stock') return Number(p.stock) > 0 && Number(p.stock) <= 2;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
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
            RAO'S THRIFT — CATALOG OPERATIONS
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mt-1">
            STREETWEAR PIECES ({products.length})
          </h1>
        </div>
        <button
          onClick={handleAddProduct}
          className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 text-xs font-mono font-bold uppercase"
        >
          + Add New Drop Piece
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-500 text-red-700 text-xs font-mono font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-black p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="SEARCH PIECES BY TITLE OR CATEGORY..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 px-3 py-2 border border-gray-300 font-mono text-xs focus:outline-none focus:border-black"
        />

        {/* Filter Tabs */}
        <div className="flex gap-2 text-xs font-mono uppercase">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 border ${filterTab === 'all' ? 'bg-black text-white border-black font-bold' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilterTab('featured')}
            className={`px-3 py-1.5 border ${filterTab === 'featured' ? 'bg-black text-white border-black font-bold' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          >
            Featured ({products.filter(p => p.is_featured).length})
          </button>
          <button
            onClick={() => setFilterTab('low_stock')}
            className={`px-3 py-1.5 border ${filterTab === 'low_stock' ? 'bg-black text-white border-black font-bold' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          >
            Low Stock ({products.filter(p => p.stock > 0 && p.stock <= 2).length})
          </button>
          <button
            onClick={() => setFilterTab('sold_out')}
            className={`px-3 py-1.5 border ${filterTab === 'sold_out' ? 'bg-black text-white border-black font-bold' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          >
            Sold Out ({products.filter(p => p.stock === 0).length})
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white border-2 border-black overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {filteredProducts.map((product) => (
            <li key={product.id} className="p-4 hover:bg-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Product Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 bg-gray-100 border border-gray-300 flex-shrink-0 overflow-hidden">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-900 uppercase">
                      {product.name}
                    </h3>
                    {product.is_featured && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-yellow-200 text-yellow-900 border border-yellow-400">
                        FEATURED DROP
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase">
                    <span>{product.category}</span>
                    <span>•</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 border text-black font-bold">
                      SIZE: {product.size || 'ONE SIZE'}
                    </span>
                    <span>•</span>
                    <span className="text-black font-semibold">
                      COND: {product.condition || 'GOOD'}
                    </span>
                  </div>

                  {product.measurements && (
                    <div className="text-[11px] font-mono text-gray-500">
                      Measurements: {product.measurements}
                    </div>
                  )}
                </div>
              </div>

              {/* Price, Stock and Actions */}
              <div className="flex items-center gap-6 self-end md:self-auto">
                <div className="text-right">
                  <div className="font-black text-base text-gray-900 font-mono">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs font-mono mt-0.5">
                    {product.stock === 0 ? (
                      <span className="text-red-600 font-bold uppercase">SOLD OUT</span>
                    ) : product.stock === 1 ? (
                      <span className="text-amber-600 font-bold uppercase">1-OF-1 PIECE</span>
                    ) : (
                      <span className="text-gray-500 uppercase">STOCK: {product.stock}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="px-3 py-1.5 border border-black hover:bg-black hover:text-white text-xs font-mono font-bold uppercase transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-3 py-1.5 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-xs font-mono font-bold uppercase transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

            </li>
          ))}
        </ul>
      </div>

      {/* Edit/Add Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        isEdit={!!editingProduct}
      />
    </div>
  );
};

export default AdminProducts;
