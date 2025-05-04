import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
  FiMapPin,
  FiClock,
  FiPackage,
  FiDollarSign,
  FiCalendar,
} from 'react-icons/fi';

function ServicesDetailPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // For editing mode
  const [editedService, setEditedService] = useState(null);

  // Filter options
  const [types, setTypes] = useState([]);
  const [packages, setPackages] = useState([]);
  const [locations, setLocations] = useState([]);

  // Fetch service details
  const fetchServiceDetails = async () => {
    try {
      const response = await api.get(`/services/${serviceId}`);
      setService(response.data);
      setEditedService(response.data);
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError('Failed to load service details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options for editing form
  const fetchFilterOptions = async () => {
    try {
      const [typesRes, packagesRes, locationsRes] = await Promise.all([
        api.get('/services/types'),
        api.get('/services/packages'),
        api.get('/services/locations'),
      ]);
      setTypes(typesRes.data);
      setPackages(packagesRes.data);
      setLocations(locationsRes.data);
    } catch (err) {
      console.error('Failed to fetch options:', err);
    }
  };

  useEffect(() => {
    fetchServiceDetails();
    fetchFilterOptions();
  }, [serviceId]);

  // Handle service deletion
  const handleDeleteService = async () => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      try {
        await api.delete(`/services/${serviceId}`);
        navigate('/dashboard/services', { replace: true });
      } catch (err) {
        console.error('Error deleting service:', err);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      await api.put(`/services/${serviceId}`, editedService);
      setService(editedService);
      setIsEditing(false);
      alert('Service updated successfully!');
    } catch (err) {
      console.error('Error updating service:', err);
      alert('Failed to update service. Please try again.');
    }
  };

  // Handle location selection for edited service
  const handleLocationChange = location => {
    if (editedService.availableLocations.includes(location)) {
      setEditedService({
        ...editedService,
        availableLocations: editedService.availableLocations.filter(loc => loc !== location),
      });
    } else {
      setEditedService({
        ...editedService,
        availableLocations: [...editedService.availableLocations, location],
      });
    }
  };

  // Format date
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>{error}</div>
        <Link to='/dashboard/services' className='inline-flex items-center text-blue-600 hover:text-blue-800'>
          <FiArrowLeft className='mr-2' /> Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Back navigation and actions */}
      <div className='flex justify-between items-center mb-6'>
        <Link to='/dashboard/services' className='inline-flex items-center text-blue-600 hover:text-blue-800'>
          <FiArrowLeft className='mr-2' /> Back to Services
        </Link>

        <div className='flex items-center gap-3'>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className='inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'
              >
                <FiX className='mr-2' /> Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className='inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'
              >
                <FiSave className='mr-2' /> Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
              >
                <FiEdit className='mr-2' /> Edit Service
              </button>
              <button
                onClick={handleDeleteService}
                className='inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'
              >
                <FiTrash2 className='mr-2' /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Service details */}
      {!isEditing ? (
        <div className='bg-white rounded-lg shadow-lg'>
          <div className='relative'>
            <div className='h-64 w-full bg-gray-300'>
              <img
                src={service.imageUrl || 'https://via.placeholder.com/1200x400?text=No+Service+Image'}
                alt={service.name}
                className='w-full h-full object-cover'
                onError={e => {
                  e.target.src = 'https://via.placeholder.com/1200x400?text=Error+Loading+Image';
                }}
              />
            </div>
            <div className='absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-bold'>
              ${service.price}
            </div>
          </div>

          <div className='p-6 pb-8'>
            <div className='flex justify-between items-start flex-wrap'>
              <div>
                <h1 className='text-3xl font-bold text-gray-800 mb-2'>{service.name}</h1>
                <div className='flex items-center mt-1 mb-4'>
                  <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2'>
                    {service.type}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className='mt-6'>
              <h2 className='text-xl font-semibold text-gray-800 mb-2'>Description</h2>
              <p className='text-gray-700'>{service.description}</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
              <div>
                <h3 className='text-lg font-semibold text-gray-800 mb-3'>Service Details</h3>
                <div className='space-y-4'>
                  <div className='flex items-center'>
                    <FiPackage className='text-blue-600 mr-3' />
                    <div>
                      <p className='text-sm text-gray-500'>Package Size</p>
                      <p className='font-medium'>{service.packageSize.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <FiClock className='text-blue-600 mr-3' />
                    <div>
                      <p className='text-sm text-gray-500'>Duration</p>
                      <p className='font-medium'>{service.duration} hours</p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <FiDollarSign className='text-blue-600 mr-3' />
                    <div>
                      <p className='text-sm text-gray-500'>Price</p>
                      <p className='font-medium'>${service.price}</p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <FiCalendar className='text-blue-600 mr-3' />
                    <div>
                      <p className='text-sm text-gray-500'>Created On</p>
                      <p className='font-medium'>{formatDate(service.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-semibold text-gray-800 mb-3'>Available Locations</h3>
                <div className='grid grid-cols-2 gap-2'>
                  {service.availableLocations.map((location, index) => (
                    <div key={index} className='flex items-center bg-gray-50 p-2 rounded'>
                      <FiMapPin className='text-blue-600 mr-2' />
                      <span>{location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h2 className='text-2xl font-bold text-gray-800 mb-6'>Edit Service</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
              <input
                type='text'
                required
                className='w-full border border-gray-300 rounded-md py-2 px-3'
                value={editedService.name}
                onChange={e => setEditedService({ ...editedService, name: e.target.value })}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Type</label>
              <select
                required
                className='w-full border border-gray-300 rounded-md py-2 px-3'
                value={editedService.type}
                onChange={e => setEditedService({ ...editedService, type: e.target.value })}
              >
                {types.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
              <textarea
                required
                rows='4'
                className='w-full border border-gray-300 rounded-md py-2 px-3'
                value={editedService.description}
                onChange={e => setEditedService({ ...editedService, description: e.target.value })}
              ></textarea>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Price ($)</label>
              <input
                type='number'
                required
                min='0'
                step='0.01'
                className='w-full border border-gray-300 rounded-md py-2 px-3'
                value={editedService.price}
                onChange={e => setEditedService({ ...editedService, price: e.target.value })}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Duration (hours)</label>
              <input
                type='number'
                required
                min='0.5'
                step='0.5'
                className='w-full border border-gray-300 rounded-md py-2 px-3'
                value={editedService.duration}
                onChange={e => setEditedService({ ...editedService, duration: e.target.value })}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Image URL</label>
              <input
                type='url'
                className='w-full border border-gray-300 rounded-md py-2 px-3'
                value={editedService.imageUrl}
                onChange={e => setEditedService({ ...editedService, imageUrl: e.target.value })}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Package Size</label>
              <select
                required
                className='w-full border border-gray-300 rounded-md py-2 px-3'
                value={editedService.packageSize}
                onChange={e => setEditedService({ ...editedService, packageSize: e.target.value })}
              >
                {packages.map((pkg, index) => (
                  <option key={index} value={pkg}>
                    {pkg.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
              <select
                className='w-full border border-gray-300 rounded-md py-2 px-3'
                value={editedService.isActive}
                onChange={e => setEditedService({ ...editedService, isActive: e.target.value === 'true' })}
              >
                <option value='true'>Active</option>
                <option value='false'>Inactive</option>
              </select>
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Available Locations</label>
              <div className='flex flex-wrap gap-2'>
                {locations.map((location, index) => (
                  <label key={index} className='flex items-center space-x-2 bg-gray-50 p-2 rounded'>
                    <input
                      type='checkbox'
                      checked={editedService.availableLocations.includes(location)}
                      onChange={() => handleLocationChange(location)}
                      className='rounded text-blue-600'
                    />
                    <span>{location}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicesDetailPage;
