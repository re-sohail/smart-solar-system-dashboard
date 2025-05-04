import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlus, FiFilter, FiX } from 'react-icons/fi';
import api from '@/api/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    price: '',
    imageUrl: '',
    additionalImages: [],
    brand: '',
    stock: '',
    installationGuide: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  // Fetch products, categories and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsResponse = await api.get('/products');
        console.log(productsResponse);
        // Ensure that products is always an array
        if (Array.isArray(productsResponse.data)) {
          setProducts(productsResponse.data);
        } else if (productsResponse.data && Array.isArray(productsResponse.data.data)) {
          // In case API returns { data: [...] } structure
          setProducts(productsResponse.data.data);
        } else if (productsResponse.data && Array.isArray(productsResponse.data.products)) {
          // In case API returns { products: [...] } structure
          setProducts(productsResponse.data.products);
        } else {
          // Fallback to empty array if response format is unexpected
          console.error('Unexpected API response format:', productsResponse.data);
          setProducts([]);
        }

        const categoriesResponse = await api.get('/products/categories');
        setCategories(categoriesResponse.data || []);

        const brandsResponse = await api.get('/products/brands');
        setBrands(brandsResponse.data || []);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
        setProducts([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      let url = '/products?';

      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (selectedBrand) url += `brand=${selectedBrand}&`;
      if (minPrice) url += `minPrice=${minPrice}&`;
      if (maxPrice) url += `maxPrice=${maxPrice}&`;

      const response = await api.get(url);
      // Apply the same handling for response data
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else {
        console.error('Unexpected API response format:', response.data);
        setProducts([]);
      }
    } catch (err) {
      setError('Failed to apply filters');
      console.error(err);
      setProducts([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = async () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    try {
      setLoading(true);
      const response = await api.get('/products');
      // Apply the same handling for response data
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else {
        console.error('Unexpected API response format:', response.data);
        setProducts([]);
      }
    } catch (err) {
      setError('Failed to reset filters');
      console.error(err);
      setProducts([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async productId => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        // setProducts(products?.filter(product => product._id !== productId));
      } catch (err) {
        setError('Failed to delete product');
        console.error(err);
      }
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async file => {
    // Here you would add your Cloudinary upload logic
    // For now, returning a placeholder URL
    return 'https://example.com/uploaded-image.jpg';
  };

  // Handle adding a new product
  const handleAddProduct = async e => {
    e.preventDefault();
    try {
      // Upload main image
      const mainImageUrl = await uploadImage(selectedImage);

      // Upload additional images
      const additionalImageUrls = await Promise.all(additionalImages.map(img => uploadImage(img)));

      const productData = {
        ...newProduct,
        imageUrl: mainImageUrl,
        additionalImages: additionalImageUrls,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
      };

      const response = await api.post('/products', productData);
      setProducts([...products, response.data]);
      setShowAddModal(false);
      resetNewProduct();
    } catch (err) {
      setError('Failed to add product');
      console.error(err);
    }
  };

  // Reset new product form
  const resetNewProduct = () => {
    setNewProduct({
      name: '',
      category: '',
      subCategory: '',
      description: '',
      price: '',
      imageUrl: '',
      additionalImages: [],
      brand: '',
      stock: '',
      installationGuide: '',
    });
    setSelectedImage(null);
    setAdditionalImages([]);
  };

  // Filter products by search term - Make sure products is an array first
  const filteredProducts = Array.isArray(products)
    ? products.filter(
        product =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  if (loading) return <div className='flex justify-center items-center h-screen'>Loading products...</div>;
  if (error) return <div className='text-red-500 flex justify-center items-center h-screen'>{error}</div>;

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Products Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors'
        >
          <FiPlus size={18} /> Add Product
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className='mb-6 bg-white rounded-lg shadow p-4'>
        <div className='flex flex-col md:flex-row gap-4 justify-between mb-4'>
          <div className='w-full md:w-1/3'>
            <input
              type='text'
              placeholder='Search products...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex gap-2'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors'
            >
              <FiFilter size={18} /> Filters
            </button>
            {(selectedCategory || selectedBrand || minPrice || maxPrice) && (
              <button
                onClick={resetFilters}
                className='flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors'
              >
                <FiX size={18} /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Brand</label>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>All Brands</option>
                {brands.map((brand, index) => (
                  <option key={index} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Min Price</label>
              <input
                type='number'
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder='Min Price'
                className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Max Price</label>
              <input
                type='number'
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder='Max Price'
                className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <button
              onClick={applyFilters}
              className='col-span-1 md:col-span-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors'
            >
              Apply Filters
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div
              key={product._id}
              className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'
            >
              <div className='relative h-48 bg-gray-200'>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className='w-full h-full object-cover'
                  onError={e => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
                <div className='absolute top-2 right-2 flex gap-2'>
                  <Link to={`/dashboard/products/${product._id}`}>
                    <button className='bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full'>
                      <FiEdit size={16} />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className='bg-red-500 hover:bg-red-600 text-white p-2 rounded-full'
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <div className='p-4'>
                <div className='flex justify-between mb-2'>
                  <span className='text-sm font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded'>
                    {product.category}
                  </span>
                  <span className='text-sm font-medium bg-green-100 text-green-800 py-1 px-2 rounded'>
                    {product.brand}
                  </span>
                </div>
                <Link to={`/dashboard/products/${product._id}`}>
                  <h2 className='text-lg font-semibold text-gray-800 mb-1 hover:text-blue-600'>{product.name}</h2>
                </Link>
                <p className='text-gray-500 text-sm mb-2 line-clamp-2'>{product.description}</p>
                <div className='flex justify-between items-center mt-3'>
                  <span className='text-lg font-bold text-gray-900'>${product.price.toFixed(2)}</span>
                  <span
                    className={`text-sm ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}
                  >
                    {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='col-span-full flex justify-center items-center py-12 text-gray-500'>
            No products found. Try adjusting your filters.
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>Add New Product</h2>
                <button onClick={() => setShowAddModal(false)} className='text-gray-500 hover:text-gray-700'>
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleAddProduct}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Product Name*</label>
                    <input
                      type='text'
                      required
                      value={newProduct.name}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Category*</label>
                    <select
                      required
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value=''>Select Category</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Sub Category</label>
                    <input
                      type='text'
                      value={newProduct.subCategory}
                      onChange={e => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Brand*</label>
                    <select
                      required
                      value={newProduct.brand}
                      onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value=''>Select Brand</option>
                      {brands.map((brand, index) => (
                        <option key={index} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Price*</label>
                    <input
                      type='number'
                      required
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                      min='0'
                      step='0.01'
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Stock Quantity*</label>
                    <input
                      type='number'
                      required
                      value={newProduct.stock}
                      onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                      min='0'
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Description*</label>
                    <textarea
                      required
                      value={newProduct.description}
                      onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                      rows='3'
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    ></textarea>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Main Image*</label>
                    <input
                      type='file'
                      required
                      onChange={e => setSelectedImage(e.target.files[0])}
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Additional Images</label>
                    <input
                      type='file'
                      multiple
                      onChange={e => setAdditionalImages(Array.from(e.target.files))}
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Installation Guide URL</label>
                    <input
                      type='url'
                      value={newProduct.installationGuide}
                      onChange={e => setNewProduct({ ...newProduct, installationGuide: e.target.value })}
                      placeholder='https://example.com/guides/product-guide.pdf'
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
                <div className='mt-8 flex justify-end gap-4'>
                  <button
                    type='button'
                    onClick={() => setShowAddModal(false)}
                    className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
