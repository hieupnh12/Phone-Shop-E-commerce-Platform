import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxVisiblePages = 5,
  size = 'md',
  className = '',
}) => {
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pages = getPageNumbers();
  const disablePrev = currentPage === 1;
  const disableNext = currentPage === totalPages;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
        disabled={disablePrev}
        onClick={() => onPageChange?.(currentPage - 1)}
        icon={ChevronLeft}
        className="px-2"
      >
        Prev
      </Button>

      {/* First Page */}
      {pages[0] > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? 'primary' : 'ghost'}
            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
            onClick={() => onPageChange?.(1)}
            className="min-w-10"
          >
            1
          </Button>
          {pages[0] > 2 && (
            <span className={`px-2 text-gray-500 ${sizeClasses[size]}`}>...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'primary' : 'ghost'}
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
          onClick={() => onPageChange?.(page)}
          className="min-w-10"
        >
          {page}
        </Button>
      ))}

      {/* Last Page */}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className={`px-2 text-gray-500 ${sizeClasses[size]}`}>...</span>
          )}
          <Button
            variant={currentPage === totalPages ? 'primary' : 'ghost'}
            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
            onClick={() => onPageChange?.(totalPages)}
            className="min-w-10"
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Next Button */}
      <Button
        variant="outline"
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
        disabled={disableNext}
        onClick={() => onPageChange?.(currentPage + 1)}
        icon={ChevronRight}
        className="px-2"
      >
        Next
      </Button>

      {/* Info */}
      <span className={`ml-4 text-gray-600 ${sizeClasses[size]}`}>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
  maxVisiblePages: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Pagination;
