import React, { useEffect, useState } from "react";
import { FaPlus, FaFileAlt, FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import EmpDocumentsForm from "./EmpDocumentsForm";
import useAuthStore from "../../../store/authStore";




const EmpDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const employeeId = useAuthStore((state) => state.user?.userId);


  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/Document/employee/${employeeId}`);
      if (res.data?.statusCode === 200) {
        setDocuments(res.data.data || []);
      }
      // console.log(res.data.data);
      
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message ||"Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div >
      {/* Header */}
      <div className="px-4 py-2 shadow mb-2 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-lg sm:text-xl text-gray-800 text-center sm:text-left">
          My Documents
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary text-sm flex items-center gap-2 cursor-pointer"
        >
          <FaPlus /> Upload Document
        </button>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, index) => (
            <div
              key={doc.documnetModelId || index}
              className="m-4 rounded-lg shadow-sm bg-white hover:shadow-md transition p-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-3">
                <FaFileAlt className="text-primary text-2xl" />
                <h3 className="font-semibold text-gray-800 truncate">
                  {doc.documnetModelName}
                </h3>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
               <span className="font-semibold">Description :</span> {doc.remark || "No remarks available."}
              </p>

              <div className="flex justify-between items-center mt-auto">
                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary text-sm hover:text-Secondary"
                >
                  <FaDownload /> View 
                </a>
                <span className="text-xs text-gray-500">
                 DOC ID: {doc.documnetModelId}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          No documents uploaded yet.
        </div>
      )}

           {/* Modal */}
      {showModal && (
        <EmpDocumentsForm
          onClose={() => setShowModal(false)}
          onSuccess={fetchDocuments}
        />
      )}
    </div>
  );
};

export default EmpDocuments;

