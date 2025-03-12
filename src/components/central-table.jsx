// CentralTable.jsx
import React from 'react';

const CentralTable = ({
  headers = [],
  data = [],
  className = '',
  headerClassName = '',
  rowClassName = '',
  rowKey = 'id',
  currentPage,
  totalPages,
  onPageChange,
  actionRenderer,
}) => {
  return (
    <div>
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        <thead className={`bg-[#111827] ${headerClassName}`}>
          <tr>
            {headers.map(header => (
              <th
                key={header.key}
                className='px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider'
              >
                {header.label}
              </th>
            ))}
            {actionRenderer && (
              <th className='px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider flex items-center justify-center'>
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-200 ${rowClassName}`}>
          {data.map(row => (
            <tr key={row[rowKey]} className={''}>
              {headers.map(header => (
                <td
                  key={`${row[rowKey]}-${header.key}`}
                  className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                  style={{
                    // color change based on status value only status cell
                    color:
                      header.key === 'status'
                        ? row[header.key] === 'pending'
                          ? '#FFA500'
                          : row[header.key] === 'approved'
                            ? 'green'
                            : row[header.key] === 'rejected'
                              ? 'red'
                              : ''
                        : '',
                    textAlign: header.key === 'isActive' ? 'center' : 'left',
                  }}
                >
                  {header.key === 'isActive' ? (row[header.key] ? 'active' : 'inactive') : row[header.key] || 'N/A'}
                </td>
              ))}
              {actionRenderer && (
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center justify-center'>
                  {actionRenderer(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {onPageChange && (
        <div className='flex justify-start items-center gap-4 mt-4'>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50'
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50'
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CentralTable;
