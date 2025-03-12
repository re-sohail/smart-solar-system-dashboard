import React, { useState } from 'react';

// UI Components
import CentralTable from '@/components/central-table';

// HOC Component
import UserTable from '@/components/UsersPage/UserTable';

// Api
import api from '@/api/api';
import useSWR from 'swr';
import { fetcher } from '@/api/fetcher';

const UserTabelWithActions = UserTable(CentralTable);

const headers = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobileNo', label: 'Mobile No' },
  { key: 'status', label: 'Status' },
  { key: 'isActive', label: 'Account Active' },
];

const UsersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);

  // Get Data
  const {
    data: userData,
    error: userDataError,
    isLoading: isUsers,
    mutate: userDataMutate,
  } = useSWR('/admin/user-list', fetcher);

  let Data = userData?.data;

  // Handle Page Change
  const handlePageChange = page => {
    setCurrentPage(page);
  };

  // Handle Approve
  const handleApprove = async id => {
    try {
      let response = await api.patch(`/admin/approve-user/${id}`, { status: 'approved' });
      console.log(response);
      userDataMutate();
    } catch (error) {
      console.log(error);
    }
  };

  // Handle Reject
  const handleReject = async id => {
    console.log(id);
    try {
      let response = await api.patch(`/admin/approve-user/${id}`, { status: 'rejected' });
      console.log(response);
      userDataMutate();
    } catch (error) {
      console.log(error);
    }
  };

  // Handle External Link
  const handleExternalLink = row => {
    console.log(row);
  };

  return (
    <div className='w-full h-full'>
      <UserTabelWithActions
        headers={headers}
        data={Data || []}
        className=''
        headerClassName='bg-[#111827]'
        onApprove={handleApprove}
        onReject={handleReject}
        onRowClick={handleExternalLink}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default UsersPage;
