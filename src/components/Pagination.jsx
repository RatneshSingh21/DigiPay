import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  paginate,
  perPageData,
  setPerPageData,
  filteredData,
  totalDataLength,
}) => {
  const entriesOptions = [3, 5, 10, 20];

  // Calculate showing range
  const startEntry = (currentPage - 1) * perPageData + 1;
  const endEntry = Math.min(currentPage * perPageData, totalDataLength);

  // Generate limited page numbers (2–4 around currentPage)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1) end = Math.min(totalPages, start + (maxVisible - 1));
    if (currentPage === totalPages)
      start = Math.max(1, totalPages - (maxVisible - 1));

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-6 mb-4 gap-4">
      {/* Showing X to Y of Z entries */}
      <div className="text-gray-600 dark:text-surface text-sm font-medium">
        Showing{" "}
        <span className="font-semibold text-gray-800 dark:text-surface">
          {startEntry}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-gray-800 dark:text-surface">
          {endEntry}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-800 dark:text-surface">
          {totalDataLength}
        </span>
      </div>

      {/* Entries per page selector */}
      <div className="flex items-center space-x-2 text-sm">
        <label
          htmlFor="entriesPerPage"
          className="text-gray-600 dark:text-surface font-medium"
        >
          Show
        </label>

        <div className="relative">
          <select
            id="entriesPerPage"
            value={perPageData}
            onChange={(e) =>
              paginate(1) || setPerPageData(Number(e.target.value))
            }
            className="appearance-none border border-primary rounded-md pl-3 pr-8 py-1.5 text-sm 
                     bg-white dark:bg-surface text-gray-700 dark:text-surface shadow-sm 
                     hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
          >
            {entriesOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-surface"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > perPageData && (
        <div className="flex items-center space-x-2 text-sm">
          {/* Prev button */}
          {currentPage > 1 && (
            <button
              onClick={() => paginate(currentPage - 1)}
              className="flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white dark:bg-surface text-gray-600 dark:text-surface hover:bg-primary/10 hover:text-primary transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </button>
          )}

          {/* Page numbers (only 2–4 visible) */}
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => paginate(page)}
              className={`px-3 py-1.5 rounded-full border shadow-sm transition ${
                currentPage === page
                  ? "bg-primary text-white border-primary font-semibold"
                  : "bg-white dark:bg-surface text-gray-600 dark:text-surface border-gray-300 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next button */}
          {currentPage < totalPages && (
            <button
              onClick={() => paginate(currentPage + 1)}
              className="flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white dark:bg-surface text-gray-600 dark:text-surface hover:bg-primary/10 hover:text-primary transition shadow-sm"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Pagination;
