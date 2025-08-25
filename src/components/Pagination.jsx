import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // npm i lucide-react

const Pagination = ({
  currentPage,
  totalPages,
  paginate,
  pageGroup,
  setPageGroup,
  perPageData,
  setPerPageData,
  filteredData,
  totalDataLength,
}) => {
  const entriesOptions = [10, 25, 50, 100];

  // Calculate showing range
  const startEntry = (currentPage - 1) * perPageData + 1;
  const endEntry = Math.min(currentPage * perPageData, totalDataLength);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-6 mb-4 gap-4">
      {/* Showing X to Y of Z entries */}
      <div className="text-gray-600 text-sm font-medium">
        Showing{" "}
        <span className="font-semibold text-gray-800">{startEntry}</span> to{" "}
        <span className="font-semibold text-gray-800">{endEntry}</span> of{" "}
        <span className="font-semibold text-gray-800">{totalDataLength}</span>{" "}
        entries
      </div>

      {/* Entries per page selector */}
<div className="flex items-center space-x-2 text-sm">
  <label
    htmlFor="entriesPerPage"
    className="text-gray-600 font-medium"
  >
    Show
  </label>

  <div className="relative">
    <select
      id="entriesPerPage"
      value={perPageData}
      onChange={(e) => setPerPageData(Number(e.target.value))}
      className="appearance-none border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm 
                 bg-white text-gray-700 shadow-sm 
                 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
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
        className="w-4 h-4 text-gray-500"
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

  <span className="text-gray-600 font-medium">entries</span>
</div>
      {/* Pagination Controls */}
      {filteredData.length > perPageData && (
        <div className="flex flex-wrap justify-center md:justify-end space-x-2 text-sm">
          {/* Large Screens */}
          <div className="hidden md:flex space-x-2">
            {pageGroup > 0 && (
              <button
                onClick={() => {
                  setPageGroup((prev) => prev - 1);
                  paginate(pageGroup * 10);
                }}
                className="flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {(() => {
              const start = pageGroup * 10 + 1;
              const end = Math.min(start + 9, totalPages);
              const buttons = [];

              for (let i = start; i <= end; i++) {
                buttons.push(
                  <button
                    key={i}
                    onClick={() => paginate(i)}
                    className={`px-3 py-1.5 rounded-full border shadow-sm transition ${
                      currentPage === i
                        ? "bg-orange-500 text-white border-orange-500 font-semibold"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-orange-50 hover:text-orange-500"
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              return buttons;
            })()}

            {(pageGroup + 1) * 10 < totalPages && (
              <button
                onClick={() => {
                  setPageGroup((prev) => prev + 1);
                  paginate(pageGroup * 10 + 11);
                }}
                className="flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Small Screens */}
          <div className="md:hidden flex items-center space-x-2">
            {currentPage > 1 && (
              <button
                onClick={() => paginate(currentPage - 1)}
                className="flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </button>
            )}

            <span className="px-3 py-1.5 text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages && (
              <button
                onClick={() => paginate(currentPage + 1)}
                className="flex items-center px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagination;
