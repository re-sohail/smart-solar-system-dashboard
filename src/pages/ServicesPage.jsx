import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { FiPlus, FiFilter, FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    packageSize: '',
    location: '',
    searchTerm: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [types, setTypes] = useState([]);
  const [packages, setPackages] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // For add service modal
  const [showModal, setShowModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    type: '',
    description: '',
    price: '',
    imageUrl: '',
    duration: '',
    packageSize: '',
    availableLocations: [],
  });

  // Fetch services based on filters
  const fetchServices = async () => {
    setLoading(true);
    try {
      let url = '/services';
      const queryParams = [];
      
      if (filters.type) queryParams.push(`type=${filters.type}`);
      if (filters.packageSize) queryParams.push(`packageSize=${filters.packageSize}`);
      if (filters.location) queryParams.push(`location=${filters.location}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await api.get(url);
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch services. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
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
      console.error('Failed to fetch filter options:', err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchFilterOptions();
  }, [filters.type, filters.packageSize, filters.location]);

  // Handle delete service
  const handleDeleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/services/${id}`);
        setServices(services.filter(service => service._id !== id));
      } catch (err) {
        console.error('Failed to delete service:', err);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  // Handle add service
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await api.post('/services', newService);
      setShowModal(false);
      setNewService({
        name: '',
        type: '',
        description: '',
        price: '',
        imageUrl: '',
        duration: '',
        packageSize: '',
        availableLocations: [],
      });
      fetchServices();
    } catch (err) {
      console.error('Failed to add service:', err);
      alert('Failed to add service. Please try again.');
    }
  };

  // Handle location selection for new service
  const handleLocationChange = (e) => {
    const location = e.target.value;
    if (location && !newService.availableLocations.includes(location)) {
      setNewService({
        ...newService,
        availableLocations: [...newService.availableLocations, location],
      });
    }
  };

  // Remove a selected location
  const removeLocation = (location) => {
    setNewService({
      ...newService,
      availableLocations: newService.availableLocations.filter(loc => loc !== location),
    });
  };

  // Filter services by search term
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Services Management</h1>
          <p className="text-gray-600 mt-1">Manage your service offerings and packages</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition duration-300"
        >
          <FiPlus className="mr-2" /> Add New Service
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            />
          </div>
          <button
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition duration-300"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="mr-2" /> Filters
          </button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Types</option>
                {types.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Size</label>
              <select
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.packageSize}
                onChange={(e) => setFilters({ ...filters, packageSize: e.target.value })}
              >
                <option value="">All Sizes</option>
                {packages.map((pkg, index) => (
                  <option key={index} value={pkg}>{pkg.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="">All Locations</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Services Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No services found. Try adjusting your filters or add a new service.
            </div>
          ) : (
            filteredServices.map((service) => (
              <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={service.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'} 
                    alt={service.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Error+Loading+Image' }}
                  />
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-full">
                    ${service.price}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 truncate">{service.name}</h3>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      {service.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 h-12 overflow-hidden">{service.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {service.packageSize.replace('_', ' ')}
                    </span>
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                      {service.duration} hours
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link 
                      to={`/dashboard/services/${service._id}`} 
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FiEye className="mr-1" /> View Details
                    </Link>
                    <div className="flex gap-2">
                      <Link 
                        to={`/dashboard/services/${service._id}`} 
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                      >
                        <FiEdit />
                      </Link>
                      <button 
                        onClick={() => handleDeleteService(service._id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New Service</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleAddService} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      value={newService.type}
                      onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      {types.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      required
                      rows="3"
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                    <input
                      type="number"
                      required
                      min="0.5"
                      step="0.5"
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      value={newService.imageUrl}
                      onChange={(e) => setNewService({ ...newService, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Size</label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      value={newService.packageSize}
                      onChange={(e) => setNewService({ ...newService, packageSize: e.target.value })}
                    >
                      <option value="">Select Package Size</option>
                      {packages.map((pkg, index) => (
                        <option key={index} value={pkg}>{pkg.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Locations</label>
                    <select
                      className="w-full border border-gray-300 rounded-md py-2 px-3 mb-2"
                      onChange={handleLocationChange}
                      value=""
                    >
                      <option value="">Select a location to add</option>
                      {locations
                        .filter(location => !newService.availableLocations.includes(location))
                        .map((location, index) => (
                          <option key={index} value={location}>{location}</option>
                        ))}
                    </select>
                    
                    {/* Display selected locations with option to remove */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newService.availableLocations.map((location, index) => (
                        <div key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center">
                          {location}
                          <button 
                            type="button"
                            onClick={() => removeLocation(location)} 
                            className="ml-1 text-blue-700 hover:text-blue-900"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicesPage;
