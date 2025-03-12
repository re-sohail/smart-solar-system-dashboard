import React from 'react';
import { Button } from '../ui/button';
import { ExternalLink } from 'lucide-react';

const UserTable = wrappedComponent => {
  return ({ onApprove, onReject, onRowClick, ...props }) => {
    const actionRender = row => (
      <div className='flex items-center gap-4'>
        {row.status === 'pending' ? (
          <>
            <Button
              onClick={() => onApprove(row?.id)}
              variant='ghost'
              size='sm'
              className='bg-green-500 cursor-pointer hover:bg-green-500'
            >
              Approve
            </Button>
            <Button
              onClick={() => onReject(row?.id)}
              variant='ghost'
              size='sm'
              className='bg-red-500 cursor-pointer hover:bg-red-500 hover:text-white text-white'
            >
              Reject
            </Button>
          </>
        ) : (
          <Button onClick={() => onRowClick(row?.id)} variant='ghost' size='sm' className='cursor-pointer'>
            <ExternalLink className='!h-6 !w-6' />
          </Button>
        )}
      </div>
    );

    return wrappedComponent({ ...props, actionRenderer: actionRender });
  };
};

export default UserTable;
