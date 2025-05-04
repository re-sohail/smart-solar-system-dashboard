import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// UI Components
import CentralTable from '@/components/central-table';

// Api
import api from '@/api/api';
import useSWR from 'swr';
import { fetcher } from '@/api/fetcher';

// Icons
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const headers = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobileNo', label: 'Mobile No' },
  { key: 'city', label: 'City' },
  { key: 'isVerified', label: 'Verified' },
];

const UsersPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get Data
  const {
    data: userData,
    error: userDataError,
    isLoading: isUsers,
    mutate: userDataMutate,
  } = useSWR('/users/all-user', fetcher);

  // Process data for table display
  const processedData =
    userData?.map(user => ({
      id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      mobileNo: user.mobileNo,
      city: user.address?.city || 'N/A',
      isVerified: user.isVerified,
      // Include original data for action handlers
      originalData: user,
    })) || [];

  // Handle Page Change
  const handlePageChange = page => {
    setCurrentPage(page);
  };

  // Navigate to user details page
  const handleViewDetails = user => {
    navigate(`/dashboard/users/${user.id}`);
  };

  // Navigate to edit user page
  const handleEditUser = user => {
    navigate(`/dashboard/users/${user.id}?edit=true`);
  };

  // Delete user
  const handleDeleteUser = async user => {
    if (window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      try {
        setIsDeleting(true);
        await api.delete(`/users/${user.id}`);
        toast.success('User deleted successfully');
        userDataMutate(); // Refresh data
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
        console.error('Delete error:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Action renderer for table
  const actionRenderer = row => (
    <div className='flex items-center justify-center gap-3'>
      <button
        onClick={() => handleViewDetails(row)}
        className='p-1 text-blue-600 hover:text-blue-800'
        title='View Details'
      >
        <FaEye size={18} />
      </button>
      <button onClick={() => handleEditUser(row)} className='p-1 text-green-600 hover:text-green-800' title='Edit User'>
        <FaEdit size={18} />
      </button>
      <button
        onClick={() => handleDeleteUser(row)}
        className='p-1 text-red-600 hover:text-red-800'
        disabled={isDeleting}
        title='Delete User'
      >
        <FaTrash size={18} />
      </button>
    </div>
  );

  return (
    <div className='w-full h-full p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>User Management</h1>
        <p className='text-gray-600'>View and manage all system users</p>
      </div>

      {isUsers ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      ) : userDataError ? (
        <div className='text-center text-red-500'>Failed to load users. Please try again.</div>
      ) : (
        <CentralTable
          headers={headers}
          data={processedData}
          className='shadow-md rounded-lg'
          headerClassName='bg-gray-800'
          rowClassName='hover:bg-gray-50'
          rowKey='id'
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          actionRenderer={actionRenderer}
        />
      )}
    </div>
  );
};

export default UsersPage;
