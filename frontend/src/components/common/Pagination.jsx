import React from "react";
import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxVisiblePages = 5,
  size = "md",
  className = "",
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
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-1 sm:gap-2 ${className}`}
    >
      {/* Previous Button */}
      <button
        disabled={disablePrev}
        onClick={() => onPageChange?.(currentPage - 1)}
        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
          disablePrev
            ? "text-gray-300 border border-gray-200 cursor-not-allowed"
            : "text-gray-700 border border-gray-300 hover:bg-gray-50"
        }`}
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Trang trước</span>
        <span className="sm:hidden">Trước</span>
      </button>

      {/* First Page */}
      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange?.(1)}
            className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 1
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className={`px-2 text-gray-500 ${sizeClasses[size]}`}>
              ...
            </span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange?.(page)}
          className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === page
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last Page */}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className={`px-2 text-gray-500 ${sizeClasses[size]}`}>
              ...
            </span>
          )}
          <button
            onClick={() => onPageChange?.(totalPages)}
            className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        disabled={disableNext}
        onClick={() => onPageChange?.(currentPage + 1)}
        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
          disableNext
            ? "text-gray-300 border border-gray-200 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90"
        }`}
      >
        <span className="hidden sm:inline">Trang sau</span>
        <span className="sm:hidden">Sau</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
  maxVisiblePages: PropTypes.number,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};

export default Pagination;
