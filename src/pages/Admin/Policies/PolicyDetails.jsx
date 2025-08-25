import React from "react";
import ComingSoon from "../../../components/ComingSoon";

const PolicyDetails = () => {
  return (
    <>
      <div>PolicyDetails</div>
      <div>
        {" "}
        <ComingSoon />
      </div>
    </>
  );
};

export default PolicyDetails;

// import React, { useState, useEffect } from "react";
// import Pagination from "../../../components/Pagination";

// const PolicyDetails = () => {
//   // Dummy data (50 records)
//   const dummyData = Array.from({ length: 50 }, (_, i) => ({
//     id: i + 1,
//     name: `Item ${i + 1}`,
//     description: `This is the description for item ${i + 1}`,
//   }));

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [perPageData, setPerPageData] = useState(10);
//   const [pageGroup, setPageGroup] = useState(0);

//   // Derived values
//   const totalDataLength = dummyData.length;
//   const totalPages = Math.ceil(totalDataLength / perPageData);

//   // Get current page data
//   const indexOfLast = currentPage * perPageData;
//   const indexOfFirst = indexOfLast - perPageData;
//   const currentData = dummyData.slice(indexOfFirst, indexOfLast);

//   // Handle paginate
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Dummy Data Table</h2>

//       {/* Table */}
//       <table className="w-full border border-gray-300 text-sm">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="p-2 border">ID</th>
//             <th className="p-2 border">Name</th>
//             <th className="p-2 border">Description</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentData.map((item) => (
//             <tr key={item.id} className="hover:bg-gray-50">
//               <td className="p-2 border text-center">{item.id}</td>
//               <td className="p-2 border">{item.name}</td>
//               <td className="p-2 border">{item.description}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         paginate={paginate}
//         pageGroup={pageGroup}
//         setPageGroup={setPageGroup}
//         perPageData={perPageData}
//         setPerPageData={setPerPageData}
//         filteredData={dummyData}
//         totalDataLength={totalDataLength}
//       />
//     </div>
//   );
// };

// export default PolicyDetails;
