import React from 'react';

const Loader = () => {
  return (
    <div className='w-full h-screen flex justify-center items-center bg-zinc-900 text-white'>
      <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#111827]'></div>
    </div>
  );
};

export default Loader;
