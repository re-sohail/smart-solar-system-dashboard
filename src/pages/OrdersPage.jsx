import React, { useEffect, useState } from 'react';
import CentralTable from '../components/central-table';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { FaEye, FaShippingFast, FaCheck } from 'react-icons/fa';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      let filteredOrders = response.data;

      // Apply status filtering
      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.orderStatus === statusFilter);
      }

      setOrders(filteredOrders);
      setTotalPages(Math.ceil(filteredOrders.length / 10)); // Assuming 10 items per page
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
      console.error('Error fetching orders:', err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const headers = [
    { key: 'id', label: 'Order ID' },
    { key: 'date', label: 'Order Date' },
    { key: 'total', label: 'Total Amount' },
    { key: 'paymentStatus', label: 'Payment' },
    { key: 'orderStatus', label: 'Order Status' },
  ];

  const tableData = orders.map(order => ({
    id: order._id.slice(-6).toUpperCase(), // Last 6 characters of ID for display
    fullId: order._id, // Full ID for actions
    date: formatDate(order.createdAt),
    total: `$${order.totalAmount.toFixed(2)}`,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    hasServices: order.services && order.services.length > 0,
  }));

  const actionRenderer = row => (
    <div className='flex gap-2 justify-center'>
      <button
        className='p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700'
        onClick={() => navigate(`/dashboard/orders/${row.fullId}`)}
        title='View Details'
      >
        <FaEye />
      </button>

      {row.orderStatus === 'pending' && (
        <button
          className='p-2 bg-green-600 text-white rounded-full hover:bg-green-700'
          onClick={() => updateOrderStatus(row.fullId, 'shipped')}
          title='Mark as Shipped'
        >
          <FaShippingFast />
        </button>
      )}

      {row.orderStatus === 'shipped' && (
        <button
          className='p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700'
          onClick={() => updateOrderStatus(row.fullId, 'delivered')}
          title='Mark as Delivered'
        >
          <FaCheck />
        </button>
      )}
    </div>
  );

  const statusOptions = ['all', 'pending', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Order Management</h1>

        <div className='flex items-center gap-4'>
          <span className='text-sm font-medium'>Filter by status:</span>
          <select
            className='bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      ) : error ? (
        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4'>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className='bg-white rounded-lg shadow-md overflow-hidden'>
            <CentralTable
              headers={headers}
              data={tableData}
              className='w-full'
              headerClassName='bg-gray-800'
              rowClassName='hover:bg-gray-50'
              rowKey='fullId'
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              actionRenderer={actionRenderer}
            />
          </div>

          <div className='mt-4 text-sm text-gray-500'>Total Orders: {orders.length}</div>
        </>
      )}
    </div>
  );
};

export default OrdersPage;
