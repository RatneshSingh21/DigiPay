import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";

const AddDepartmentForm = ({ onClose, isEdit, initialData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    adminUserId: null,
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData(initialData);
    }
  }, [isEdit, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    setLoading(true);
    try {
      let response;

      if (isEdit === "Edit" && formData.id) {
        response = await axiosInstance.put(
          `/Department/${formData.id}`,
          payload
        );
      } else {
        response = await axiosInstance.post("/Department", payload);
      }

      toast.success("Department Saved Successfully");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error saving Departments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {isEdit === "Edit" ? "Edit" : "New"} Department
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Department Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Description<span className="text-red-500">*</span>
            </label>
            <textarea
              rows="3"
              maxLength="250"
              name="description"
              placeholder="Max 250 characters"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-start gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-primary hover:bg-secondary"
              }`}
            >
              {loading ? <Spinner /> : "Save"}
            </button>

            <button
              type="reset"
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100"
              onClick={() =>
                setFormData({
                  name: "",
                  adminUserId: null,
                  description: "",
                })
              }
            >
              Clear
            </button>
          </div>

          <p className="text-sm text-red-500 mt-1">
            * Indicates mandatory fields
          </p>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentForm;
