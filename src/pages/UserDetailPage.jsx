import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { fetcher } from '@/api/fetcher';
import api from '@/api/api';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaSave, FaEdit } from 'react-icons/fa';

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const [editMode, setEditMode] = useState(isEditMode);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    street: '',
    city: '',
    country: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user data
  const { data: user, error, isLoading, mutate } = useSWR(userId ? `/users/${userId}` : null, fetcher);

  // Set form data once user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobileNo: user.mobileNo || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        country: user.address?.country || '',
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const updatedUser = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNo: formData.mobileNo,
        address: {
          street: formData.street,
          city: formData.city,
          country: formData.country,
        },
      };

      await api.put(`/users/${userId}`, updatedUser);
      toast.success('User updated successfully');
      setEditMode(false);
      mutate(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go back to users list
  const handleBack = () => {
    navigate('/dashboard/users');
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='text-center text-red-500 p-4'>Failed to load user details. Please try again.</div>
        <button
          onClick={handleBack}
          className='flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
        >
          <FaArrowLeft /> Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <button
          onClick={handleBack}
          className='flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
        >
          <FaArrowLeft /> Back to Users
        </button>

        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className='flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            <FaEdit /> Edit User
          </button>
        )}
      </div>

      <div className='bg-white shadow-md rounded-lg p-6'>
        <h1 className='text-2xl font-bold text-gray-800 mb-6'>{editMode ? 'Edit User' : 'User Details'}</h1>

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>First Name</label>
              {editMode ? (
                <input
                  type='text'
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              ) : (
                <p className='text-gray-800'>{formData.firstName}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name</label>
              {editMode ? (
                <input
                  type='text'
                  name='lastName'
                  value={formData.lastName}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              ) : (
                <p className='text-gray-800'>{formData.lastName}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
              {editMode ? (
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              ) : (
                <p className='text-gray-800'>{formData.email}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Mobile Number</label>
              {editMode ? (
                <input
                  type='text'
                  name='mobileNo'
                  value={formData.mobileNo}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              ) : (
                <p className='text-gray-800'>{formData.mobileNo}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Street</label>
              {editMode ? (
                <input
                  type='text'
                  name='street'
                  value={formData.street}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                />
              ) : (
                <p className='text-gray-800'>{formData.street}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>City</label>
              {editMode ? (
                <input
                  type='text'
                  name='city'
                  value={formData.city}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                />
              ) : (
                <p className='text-gray-800'>{formData.city}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Country</label>
              {editMode ? (
                <input
                  type='text'
                  name='country'
                  value={formData.country}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                />
              ) : (
                <p className='text-gray-800'>{formData.country}</p>
              )}
            </div>

            {!editMode && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Verified</label>
                <p className='text-gray-800'>
                  {user?.isVerified ? (
                    <span className='text-green-600'>Yes</span>
                  ) : (
                    <span className='text-red-600'>No</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {editMode && (
            <div className='flex justify-end mt-6'>
              <button
                type='button'
                onClick={() => setEditMode(false)}
                className='px-4 py-2 mr-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Saving...'
                ) : (
                  <>
                    <FaSave /> Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        <div className='mt-8'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4'>Additional Information</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <p className='text-sm font-medium text-gray-700'>User ID</p>
              <p className='text-gray-800'>{user?._id}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Registration Date</p>
              <p className='text-gray-800'>{new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
