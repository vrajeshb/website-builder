import { useState, useMemo } from 'react';
import { ITEMS_PER_PAGE } from '../constants';

export const usePagination = <T>(items: T[], itemsPerPage: number = ITEMS_PER_PAGE) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when items change significantly
  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    totalItems: items.length
  };
};