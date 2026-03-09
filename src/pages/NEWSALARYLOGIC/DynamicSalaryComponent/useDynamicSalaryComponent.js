import { useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useDynamicSalaryComponent() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComponents = async (policyId) => {
    if (!policyId) {
      setComponents([]);
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/DynamicSalaryComponent/policy/${policyId}`,
      );

      setComponents(res.data?.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setComponents([]);
      } else {
        console.log(err);
        // toast.error("Failed to fetch dynamic components");
      }
    } finally {
      setLoading(false);
    }
  };

  const createComponent = async (payload) => {
    try {
      await axiosInstance.post(`/DynamicSalaryComponent/create`, payload);
      toast.success("Dynamic component created");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };

  const deleteComponent = async (id) => {
    try {
      await axiosInstance.delete(`/DynamicSalaryComponent/${id}`);
      toast.success("Component deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return {
    components,
    loading,
    fetchComponents,
    createComponent,
    deleteComponent,
  };
}
