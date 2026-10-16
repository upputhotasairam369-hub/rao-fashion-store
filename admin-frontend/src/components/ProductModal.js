import React, { useState, useEffect } from 'react';
import { api } from '../api/api';

const ProductModal = ({ isOpen, onClose, onSave, product = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: '',
    size: 'One Size',
    condition: 'Good',
    measurements: '',
    flaws: '',
    is_featured: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = [
    'Oversized Tees',
    'Hoodies & Sweatshirts',
    'Baggy Denim',
    'Vintage Shirts',
    'Jackets & Outerwear',
    'Accessories'
  ];

  const conditions = [
    'New With Tags',
    'Like New',
    'Good',
    'Fair'
  ];

  // Pre-fill form for edit mode
  useEffect(() => {
    if (isOpen) {
      if (isEdit && product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          category: product.category || '',
          stock: product.stock !== undefined ? product.stock : 1,
          image_url: product.image_url || '',
          size: product.size || 'One Size',
          condition: product.condition || 'Good',
          measurements: product.measurements || '',
          flaws: product.flaws || '',
          is_featured: Boolean(product.is_featured)
        });
        setImagePreview(product.image_url || '');
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'Oversized Tees',
          stock: '1',
          image_url: '',
          size: 'Oversized L',
          condition: 'Good',
          measurements: 'Chest: 24", Length: 29"',
          flaws: 'None',
          is_featured: false
        });
        setImagePreview('');
      }
      setImageFile(null);
      setError('');
    }
  }, [isOpen, isEdit, product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const data = new FormData();
      data.append('file', file);

      const response = await api.post('/api/v1/upload/image', data);
      const imageUrl = response.data.file_url.startsWith('http') 
        ? response.data.file_url 
        : `${api.defaults.baseURL}${response.data.file_url}`;
      
      setFormData(prev => ({
        ...prev,
        image_url: imageUrl
      }));
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError('Failed to upload image. You can also paste an image URL directly.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        image_url: formData.image_url.trim(),
        size: formData.size.trim(),
        condition: formData.condition,
        measurements: formData.measurements.trim(),
        flaws: formData.flaws.trim(),
        is_featured: formData.is_featured
      };

      if (!payload.name || !payload.category || isNaN(payload.price)) {
        throw new Error('Please fill in all required fields');
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900">
              {isEdit ? 'Edit Streetwear Piece' : 'Add New Streetwear Drop'}
            </h2>
            <p className="text-xs font-mono text-gray-500">RAO'S THRIFT INVENTORY MANAGEMENT</p>
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Item Title *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black font-sans text-sm"
                placeholder="e.g. Acid Wash Nirvana Vintage Graphic Tee"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Collection / Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price in INR */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                step="1"
                name="price"
                required
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black font-sans text-sm"
                placeholder="e.g. 1499"
              />
            </div>

            {/* Tagged Size */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Tagged Size *
              </label>
              <input
                type="text"
                name="size"
                required
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black font-sans text-sm"
                placeholder="e.g. Oversized XL, 32x32, One Size"
              />
            </div>

            {/* Thrift Condition */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Thrift Condition *
              </label>
              <select
                name="condition"
                required
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
              >
                {conditions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Stock Quantity (0 = Sold Out, 1 = 1-of-1) *
              </label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black font-sans text-sm"
                placeholder="1"
              />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-black focus:ring-black border-gray-300"
                />
                <span className="text-xs font-mono font-bold uppercase text-gray-800">
                  Feature in Drop 04 / Homepage Highlights
                </span>
              </label>
            </div>

            {/* Exact Measurements */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Garment Measurements
              </label>
              <input
                type="text"
                name="measurements"
                value={formData.measurements}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black font-sans text-sm"
                placeholder='e.g. Pit to pit: 24.5", Length: 29.5", Shoulder: 22"'
              />
            </div>

            {/* Flaws and Distressing */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Flaws & Character Disclosure
              </label>
              <input
                type="text"
                name="flaws"
                value={formData.flaws}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black font-sans text-sm"
                placeholder="e.g. Natural vintage fading on graphic, clean hem (or 'None')"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Curator Description
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black font-sans text-sm"
                placeholder="Describe fit, fabric weight, archival backstory, and styling tips..."
              />
            </div>

            {/* Image URL or File Upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1">
                Product Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black font-sans text-sm mb-2"
                placeholder="https://images.unsplash.com/... or upload below"
              />
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-black file:text-xs file:font-mono file:bg-gray-100 hover:file:bg-black hover:file:text-white cursor-pointer"
                />
                {uploadingImage && <span className="text-xs font-mono text-gray-500">Uploading...</span>}
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="md:col-span-2">
                <p className="text-[11px] font-mono text-gray-500 uppercase mb-1">Image Preview:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-28 h-36 object-cover border border-gray-300"
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-xs font-mono uppercase font-bold hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-black text-white hover:bg-gray-800 text-xs font-mono uppercase font-bold"
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Piece' : 'Add Piece to Drop')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
