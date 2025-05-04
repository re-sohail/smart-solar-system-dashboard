import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { FiSave, FiTrash2, FiArrowLeft, FiEdit, FiX, FiImage } from 'react-icons/fi';
import api from '@/api/api';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Image upload states
  const [newMainImage, setNewMainImage] = useState(null);
  const [newAdditionalImages, setNewAdditionalImages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data);
        setEditedProduct(response.data);
        setNewStock(response.data.stock.toString());
      } catch (err) {
        setError('Failed to fetch product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdateStock = async () => {
    try {
      await api.put(`/products/${productId}/stock`, {
        stock: parseInt(newStock),
      });
      setProduct({ ...product, stock: parseInt(newStock) });
      alert('Stock updated successfully');
    } catch (err) {
      setError('Failed to update stock');
      console.error(err);
    }
  };

  const handleDeleteProduct = async () => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await api.delete(`/products/${productId}`);
        navigate('/dashboard/products');
      } catch (err) {
        setError('Failed to delete product');
        console.error(err);
      }
    }
  };

  const uploadImage = async file => {
    // Here you would add your Cloudinary upload logic
    // For now, returning a placeholder URL
    return 'https://example.com/uploaded-image.jpg';
  };

  const handleSaveChanges = async () => {
    try {
      let updatedProductData = { ...editedProduct };

      // Upload new main image if provided
      if (newMainImage) {
        const mainImageUrl = await uploadImage(newMainImage);
        updatedProductData.imageUrl = mainImageUrl;
      }

      // Upload new additional images if provided
      if (newAdditionalImages.length > 0) {
        const additionalImageUrls = await Promise.all(newAdditionalImages.map(img => uploadImage(img)));
        updatedProductData.additionalImages = [...(updatedProductData.additionalImages || []), ...additionalImageUrls];
      }

      const response = await api.put(`/products/${productId}`, updatedProductData);
      setProduct(response.data);
      setEditMode(false);
      setNewMainImage(null);
      setNewAdditionalImages([]);
      alert('Product updated successfully');
    } catch (err) {
      setError('Failed to update product');
      console.error(err);
    }
  };

  const handleRemoveAdditionalImage = index => {
    if (editMode) {
      const updatedImages = [...editedProduct.additionalImages];
      updatedImages.splice(index, 1);
      setEditedProduct({ ...editedProduct, additionalImages: updatedImages });
    }
  };

  if (loading) return <div className='flex justify-center items-center h-screen'>Loading product details...</div>;
  if (error) return <div className='text-red-500 flex justify-center items-center h-screen'>{error}</div>;
  if (!product) return <div className='text-red-500 flex justify-center items-center h-screen'>Product not found</div>;

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center mb-6'>
        <button
          onClick={() => navigate('/dashboard/products')}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-800'
        >
          <FiArrowLeft size={20} /> Back to Products
        </button>

        <div className='flex gap-2'>
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors'
              >
                <FiEdit size={18} /> Edit Product
              </button>
              <button
                onClick={handleDeleteProduct}
                className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors'
              >
                <FiTrash2 size={18} /> Delete Product
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveChanges}
                className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors'
              >
                <FiSave size={18} /> Save Changes
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditedProduct(product);
                }}
                className='flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors'
              >
                <FiX size={18} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-6'>
          {/* Product Images */}
          <div>
            <div className='bg-gray-100 rounded-lg overflow-hidden mb-4 aspect-w-4 aspect-h-3'>
              <img
                src={editMode && newMainImage ? URL.createObjectURL(newMainImage) : product.imageUrl}
                alt={product.name}
                className='w-full h-[400px] object-contain'
                onError={e => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                }}
              />
            </div>

            {/* Thumbnails */}
            <div className='flex gap-2 overflow-x-auto pb-2'>
              <div
                className={`w-24 h-24 rounded-lg overflow-hidden cursor-pointer border-2 ${activeImageIndex === -1 ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => setActiveImageIndex(-1)}
              >
                <img src={product.imageUrl} alt='Main' className='w-full h-full object-cover' />
              </div>

              {(product.additionalImages || []).map((img, index) => (
                <div
                  key={index}
                  className={`relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer border-2 ${activeImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={img} alt={`Additional ${index + 1}`} className='w-full h-full object-cover' />
                  {editMode && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveAdditionalImage(index);
                      }}
                      className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full'
                    >
                      <FiX size={12} />
                    </button>
                  )}
                </div>
              ))}

              {editMode && (
                <>
                  <label
                    htmlFor='main-image-upload'
                    className='flex flex-col items-center justify-center w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'
                  >
                    <FiImage size={24} className='text-gray-400' />
                    <span className='text-xs text-gray-500'>Main</span>
                    <input
                      id='main-image-upload'
                      type='file'
                      className='hidden'
                      onChange={e => setNewMainImage(e.target.files[0])}
                    />
                  </label>

                  <label
                    htmlFor='additional-images-upload'
                    className='flex flex-col items-center justify-center w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'
                  >
                    <FiImage size={24} className='text-gray-400' />
                    <span className='text-xs text-gray-500'>Additional</span>
                    <input
                      id='additional-images-upload'
                      type='file'
                      multiple
                      className='hidden'
                      onChange={e => setNewAdditionalImages(Array.from(e.target.files))}
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            {!editMode ? (
              <>
                <div className='flex justify-between items-start mb-4'>
                  <h1 className='text-3xl font-bold text-gray-800'>{product.name}</h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className='flex gap-4 mb-6'>
                  <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
                    {product.category}
                  </span>
                  {product.subCategory && (
                    <span className='px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium'>
                      {product.subCategory}
                    </span>
                  )}
                  <span className='px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium'>
                    {product.brand}
                  </span>
                </div>

                <div className='flex items-baseline gap-2 mb-6'>
                  <span className='text-3xl font-bold text-gray-900'>${product.price.toFixed(2)}</span>
                  {product.ratings && product.ratings.average > 0 && (
                    <div className='flex items-center gap-1 text-sm'>
                      <div className='flex'>
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(product.ratings.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                          </svg>
                        ))}
                      </div>
                      <span className='text-gray-600'>({product.ratings.count} reviews)</span>
                    </div>
                  )}
                </div>

                <div className='mb-6'>
                  <h2 className='text-lg font-semibold mb-2'>Description</h2>
                  <p className='text-gray-700'>{product.description}</p>
                </div>

                <div className='mb-6 flex justify-between items-center p-4 bg-gray-50 rounded-lg'>
                  <div>
                    <h2 className='text-lg font-semibold mb-1'>Inventory</h2>
                    <div className='flex items-center'>
                      <span
                        className={`text-lg font-bold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}
                      >
                        {product.stock} items
                      </span>
                      <span className='ml-2 text-sm text-gray-600'>
                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      value={newStock}
                      onChange={e => setNewStock(e.target.value)}
                      min='0'
                      className='w-24 p-2 border border-gray-300 rounded-lg'
                    />
                    <button
                      onClick={handleUpdateStock}
                      className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors'
                    >
                      Update
                    </button>
                  </div>
                </div>

                {product.installationGuide && (
                  <div className='mb-6'>
                    <h2 className='text-lg font-semibold mb-2'>Resources</h2>
                    <a
                      href={product.installationGuide}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-800 flex items-center gap-2'
                    >
                      Installation Guide{' '}
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                        />
                      </svg>
                    </a>
                  </div>
                )}

                <div className='text-sm text-gray-500'>
                  <div className='mb-1'>
                    <span className='font-medium'>Product ID:</span> {product._id}
                  </div>
                  <div className='mb-1'>
                    <span className='font-medium'>Created:</span> {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className='font-medium'>Last Updated:</span>{' '}
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </>
            ) : (
              /* Edit Form */
              <div className='space-y-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Product Name*</label>
                  <input
                    type='text'
                    required
                    value={editedProduct.name}
                    onChange={e => setEditedProduct({ ...editedProduct, name: e.target.value })}
                    className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Category*</label>
                    <input
                      type='text'
                      required
                      value={editedProduct.category}
                      onChange={e => setEditedProduct({ ...editedProduct, category: e.target.value })}
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Sub Category</label>
                    <input
                      type='text'
                      value={editedProduct.subCategory || ''}
                      onChange={e => setEditedProduct({ ...editedProduct, subCategory: e.target.value })}
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Brand*</label>
                    <input
                      type='text'
                      required
                      value={editedProduct.brand}
                      onChange={e => setEditedProduct({ ...editedProduct, brand: e.target.value })}
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Price*</label>
                    <input
                      type='number'
                      required
                      value={editedProduct.price}
                      onChange={e => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) })}
                      min='0'
                      step='0.01'
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Description*</label>
                  <textarea
                    required
                    value={editedProduct.description}
                    onChange={e => setEditedProduct({ ...editedProduct, description: e.target.value })}
                    rows='4'
                    className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  ></textarea>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Stock Quantity*</label>
                  <input
                    type='number'
                    required
                    value={editedProduct.stock}
                    onChange={e => setEditedProduct({ ...editedProduct, stock: parseInt(e.target.value) })}
                    min='0'
                    className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Installation Guide URL</label>
                  <input
                    type='url'
                    value={editedProduct.installationGuide || ''}
                    onChange={e => setEditedProduct({ ...editedProduct, installationGuide: e.target.value })}
                    placeholder='https://example.com/guides/product-guide.pdf'
                    className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={editedProduct.isActive}
                      onChange={e => setEditedProduct({ ...editedProduct, isActive: e.target.checked })}
                      className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                    />
                    <span className='ml-2 text-gray-700'>Active Product</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
