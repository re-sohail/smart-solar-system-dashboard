// React Library
import React, { lazy, Suspense } from 'react';

// React Router dom
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Global Context
import { useAuth } from '@/context/auth-context';

// UI Components
import Loader from './components/loader/loader';

// Lazy Loaded Components
const Login = lazy(() => import('./pages/LoginPage'));
const Layout = lazy(() => import('./layouts/Layout'));
const Dashboard = lazy(() => import('./pages/DashboardPage'));
const Users = lazy(() => import('./pages/UsersPage'));
const UserDetail = lazy(() => import('./pages/UserDetailPage'));
const Products = lazy(() => import('./pages/ProductsPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetailPage'));
const Orders = lazy(() => import('./pages/OrdersPage'));
const OrderDetail = lazy(() => import('./pages/OrderDetailPage'));
const Categories = lazy(() => import('./pages/CategoriesPage'));
const NotFound = lazy(() => import('./pages/NotFoundPage'));

//  Protected Routes Functionality
const ProtectedRoute = () => {
  const { isAuth } = useAuth();

  console.log('isAuth', isAuth);

  if (!isAuth) {
    return <Navigate to='/login' replace />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Outlet />
    </Suspense>
  );
};

// Unathenicated Routes
const UnathenicatedRoute = () => {
  const { isAuth } = useAuth();
  console.log('isAuth', isAuth);

  if (isAuth) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Outlet />
    </Suspense>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<UnathenicatedRoute />}>
          <Route path='/login' element={<Login />} />
        </Route>

        {/* redirect to Dashboard */}
        <Route path='/' element={<Navigate to={'/dashboard'} />} />

        {/* Protected Route */}
        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<Layout />}>
            <Route index element={<Dashboard />} />

            {/* Users Routes */}
            <Route path='users' element={<Users />} />
            <Route path='users/:userId' element={<UserDetail />} />

            {/* Products Route */}
            <Route path='products' element={<Products />} />
            <Route path='products/:productId' element={<ProductDetail />} />

            {/* Orders Routes */}
            <Route path='orders' element={<Orders />} />
            <Route path='orders/:orderId' element={<OrderDetail />} />

            {/* Categories Route */}
            <Route path='categories' element={<Categories />} />
          </Route>
        </Route>

        {/* Not Found Page */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
