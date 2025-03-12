// React Library
import React from 'react';

// React Router dom
import { Outlet, useLocation } from 'react-router-dom';

// Shadcn Components
import { Button } from '@/components/ui/button';

// UI Components
import Sidebar from '@/components/AppSidebar';

// Custom Hooks
import { generateTitleFromPath } from '@/hooks/useGenrateTitleFromPayh';

// Icons
import { Bell, User } from 'lucide-react';

const Layout = () => {
  let { pathname } = useLocation();

  const title = generateTitleFromPath(pathname);

  return (
    <div className='w-full h-screen flex items-start justify-start overflow-hidden'>
      <div className='w-full max-w-[300px] h-full'>
        <Sidebar />
      </div>
      <main className='w-[calc(100%-300px)] h-full'>
        <div className='w-full h-[65px] bg-white shadow-md flex items-center justify-between px-6'>
          <h1 className='text-2xl font-semibold'>{title}</h1>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='lg' className='cursor-pointer'>
              <Bell className='!h-6 !w-6' />
            </Button>
            <Button variant='ghost' size='lg' className='cursor-pointer'>
              <User className='!h-6 !w-6' />
            </Button>
          </div>
        </div>
        <div className='w-full h-[calc(100%-65px)] p-6'>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
