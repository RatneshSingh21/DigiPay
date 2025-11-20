import React, { useEffect, useState } from "react";
import { FaPlus, FaFileAlt, FaDownload, FaStickyNote } from "react-icons/fa";
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
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="px-6 py-3 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
          My Documents
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-secondary transition cursor-pointer text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 shadow"
        >
          <FaPlus /> Upload Document
        </button>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : documents.length > 0 ? (
        <div className="grid gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc, index) => (
            <div
              key={doc.documnetModelId || index}
              className="rounded-xl bg-white shadow-md hover:shadow-lg hover:border-blue-200 hover:cursor-pointer transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="p-5 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-lg truncate flex items-center gap-2">
                    <FaFileAlt className="text-primary" />
                    {doc.documnetModelName || "Untitled Document"}
                  </h3>
                  <span className="text-xs text-gray-400">
                    ID: #{doc.documnetModelId}
                  </span>
                </div>

                {/* Description */}
                <div className="bg-gray-50 border border-gray-100 rounded-md p-3 mb-4">
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <FaStickyNote className="mt-0.5 text-gray-500" />
                    <span>
                      <strong>Description:</strong>{" "}
                      {doc.remark || "No remarks available."}
                    </span>
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-100">
                  {doc.documentUrl ? (
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary text-sm hover:text-secondary transition"
                    >
                      <FaDownload /> View Document
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">No File</span>
                  )}
                  <span className="text-xs text-gray-400 italic">
                    Uploaded
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-20">
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
