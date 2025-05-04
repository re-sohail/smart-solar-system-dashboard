import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  FaArrowLeft,
  FaBoxOpen,
  FaShippingFast,
  FaRegCreditCard,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
} from 'react-icons/fa';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch order details');
      setLoading(false);
      console.error('Error fetching order details:', err);
    }
  };

  const updateOrderStatus = async newStatus => {
    try {
      setUpdatingStatus(true);
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      await fetchOrderDetails();
      setUpdatingStatus(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      setUpdatingStatus(false);
    }
  };

  const updateServiceStatus = async (serviceId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/orders/${orderId}/service`, {
        serviceId: serviceId,
        status: newStatus,
      });
      await fetchOrderDetails();
      setUpdatingStatus(false);
    } catch (error) {
      console.error('Error updating service status:', error);
      setUpdatingStatus(false);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = status => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusClass = status => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIdDisplay = item => {
    if (!item) return 'N/A';

    // If item is an object with _id property
    if (typeof item === 'object' && item._id) {
      return item._id.toString().slice(-6).toUpperCase();
    }

    // If item is an object but represents a product reference
    if (typeof item === 'object' && item.product) {
      if (typeof item.product === 'string') {
        return item.product.slice(-6).toUpperCase();
      } else if (item.product._id) {
        return item.product._id.toString().slice(-6).toUpperCase();
      }
    }

    // If item is a string
    if (typeof item === 'string') {
      return item.slice(-6).toUpperCase();
    }

    // Fallback
    return String(item).slice(-6).toUpperCase();
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className='p-6'>
        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4'>
          <p>{error || 'Order not found'}</p>
        </div>
        <button className='px-4 py-2 bg-gray-200 rounded flex items-center gap-2' onClick={() => navigate('/orders')}>
          <FaArrowLeft /> Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className='p-6'>
      {/* Header with back button */}
      <div className='flex flex-wrap justify-between items-center mb-6'>
        <div className='flex items-center gap-4'>
          <button
            className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center gap-2 transition-colors'
            onClick={() => navigate('/dashboard/orders')}
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className='text-2xl font-bold text-gray-800'>Order #{order._id.slice(-6).toUpperCase()}</h1>
        </div>
        <div className='flex gap-3 mt-3 sm:mt-0'>
          {order.orderStatus === 'pending' && (
            <button
              onClick={() => updateOrderStatus('shipped')}
              disabled={updatingStatus}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
            >
              <FaShippingFast /> Mark as Shipped
            </button>
          )}
          {order.orderStatus === 'shipped' && (
            <button
              onClick={() => updateOrderStatus('delivered')}
              disabled={updatingStatus}
              className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2'
            >
              <FaBoxOpen /> Mark as Delivered
            </button>
          )}
          {(order.orderStatus === 'pending' || order.orderStatus === 'shipped') && (
            <button
              onClick={() => updateOrderStatus('cancelled')}
              disabled={updatingStatus}
              className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50'
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Order summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        {/* Order Status */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <div className='flex items-center gap-2 mb-2 text-gray-600'>
            <FaBoxOpen /> <span className='font-medium'>Order Status</span>
          </div>
          <div className='flex flex-col'>
            <span className={`text-sm px-3 py-1 rounded-full w-fit ${getStatusClass(order.orderStatus)}`}>
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
            <span className='text-sm text-gray-500 mt-2'>Created: {formatDate(order.createdAt)}</span>
            <span className='text-sm text-gray-500'>Last Updated: {formatDate(order.updatedAt)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <div className='flex items-center gap-2 mb-2 text-gray-600'>
            <FaRegCreditCard /> <span className='font-medium'>Payment Information</span>
          </div>
          <div className='flex flex-col'>
            <span className={`text-sm px-3 py-1 rounded-full w-fit ${getPaymentStatusClass(order.paymentStatus)}`}>
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </span>
            <span className='text-sm text-gray-500 mt-2'>
              Method: {order.paymentMethod.replace('_', ' ').toUpperCase()}
            </span>
            <span className='text-sm text-gray-500'>Total: ${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping Info */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <div className='flex items-center gap-2 mb-2 text-gray-600'>
            <FaMapMarkerAlt /> <span className='font-medium'>Shipping Address</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-sm text-gray-700'>
              {order.shippingAddress.city}, {order.shippingAddress.country}
            </span>
            {order.user ? (
              <div className='flex items-center gap-2 mt-2 text-sm text-gray-500'>
                <FaUser /> Customer: {order.user.name || 'User ID: ' + order.user._id.slice(-6)}
              </div>
            ) : (
              <span className='text-sm text-gray-500 mt-2'>Guest Checkout</span>
            )}
          </div>
        </div>
      </div>

      {/* Products section */}
      <div className='bg-white rounded-lg shadow-md overflow-hidden mb-6'>
        <div className='border-b border-gray-200 bg-gray-50 px-6 py-4'>
          <h2 className='text-lg font-medium text-gray-800'>Products</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Product ID
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Quantity
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Price
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Total
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {order?.products?.map(item => (
                <tr key={item._id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{getIdDisplay(item)}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{item?.quantity}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>${item?.price.toFixed(2)}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    ${(item?.price * item?.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className='bg-gray-50'>
              <tr>
                <td colSpan='3' className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right'>
                  Products Total:
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  ${order.products.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Services section, only shown if there are services */}
      {order.services && order.services.length > 0 && (
        <div className='bg-white rounded-lg shadow-md overflow-hidden mb-6'>
          <div className='border-b border-gray-200 bg-gray-50 px-6 py-4'>
            <h2 className='text-lg font-medium text-gray-800'>Services</h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Service ID
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Price
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Scheduled Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {order.services.map(service => (
                  <tr key={service._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {getIdDisplay(service.service)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>${service.price.toFixed(2)}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(service.scheduledDate)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(service.status)}`}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      {service.status === 'pending' && (
                        <button
                          onClick={() => updateServiceStatus(service._id, 'completed')}
                          disabled={updatingStatus}
                          className='px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50'
                        >
                          Complete Service
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className='bg-gray-50'>
                <tr>
                  <td colSpan='4' className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right'>
                    Services Total:
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    ${order.services.reduce((sum, service) => sum + service.price, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-lg font-medium text-gray-800 mb-4'>Order Summary</h2>
        <div className='space-y-2 text-gray-700'>
          <div className='flex justify-between'>
            <span>Products Subtotal:</span>
            <span>${order.products.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
          </div>

          {order.services && order.services.length > 0 && (
            <div className='flex justify-between'>
              <span>Services Subtotal:</span>
              <span>${order.services.reduce((sum, service) => sum + service.price, 0).toFixed(2)}</span>
            </div>
          )}

          <div className='border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium text-lg'>
            <span>Total:</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
