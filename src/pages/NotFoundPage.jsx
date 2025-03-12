// React Libraries
import React from 'react';

// React Router Libraries
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <h1 className='text-4xl font-bold'>404 - Page Not Found</h1>
      <p className='mt-4 text-lg'>The page you're looking for doesn't exist.</p>
      <Link to={'/dashboard'} className='mt-4 font-semibold hover:text-[#111827]'>
        Go back to Dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
