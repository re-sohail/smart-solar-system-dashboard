// React Library
import React from 'react';

// React Router Dom
import { NavLink, useLocation } from 'react-router-dom';

// Sidebar Features
import { SidebarFeatures } from '@/constant/SidebarFeatures';
import { Button } from './ui/button';

const Sidebar = () => {
  return (
    <div className='w-full h-screen bg-[#111827] text-white'>
      <h1 className='w-full text-center text-2xl font-semibold py-4 border-b'>Admin Dashboard</h1>
      <div className='px-3 mt-4'>
        <ul className='flex flex-col gap-1'>
          {SidebarFeatures.map((feature, index) => (
            <li key={index}>
              <NavLink
                to={feature.link}
                end={feature.link === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800 hover:text-blue-300'
                  }`
                }
              >
                <feature.icon className='mr-3 h-6 w-6' aria-hidden='true' />
                <span className='text-base font-medium'>{feature.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
