import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";

const AddDesignationForm = ({ onClose, isEdit, initialData, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    level: "",
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
          `/Designation/${formData.id}`,
          payload
        );
      } else {
        response = await axiosInstance.post("/Designation", payload);
      }

      toast.success("Designation Saved Successfully");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving Designation");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";


  return (
    <>
      <div
        className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute top-4 right-4 cursor-pointer text-gray-600 hover:text-red-500 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>

          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {isEdit === "Edit" ? "Edit" : "New"} Designation
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Designation Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                autoFocus
                placeholder="Designation Name"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Designation Level<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                placeholder="Designation Level"
                className={inputClass}
                required
              />
            </div>

            <div className="flex items-center justify-start gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 cursor-pointer rounded-lg text-white ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-primary hover:bg-secondary"
                }`}
              >
                {loading ? <Spinner /> : "Save"}
              </button>

              <button
                type="reset"
                className="border cursor-pointer border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100"
                onClick={() =>
                  setFormData({
                    title: "",
                    level: "",
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
    </>
  );
};

export default AddDesignationForm;
