import { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useDefaultSalaryComponentDefinition(policyId) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComponents = async () => {
    if (!policyId) return;

    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/DefaultSalaryComponentDefinition/policy/${policyId}`
      );
      setComponents(res.data?.data || []);
    } catch (err) {
      console.log(err)
      // toast.error("Failed to fetch components");
    } finally {
      setLoading(false);
    }
  };

  const createComponent = async (payload) => {
    try {
      await axiosInstance.post(
        `/DefaultSalaryComponentDefinition/policy/${policyId}/create`,
        payload
      );
      toast.success("Component created successfully");
      fetchComponents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };

  const updateComponent = async (id, payload) => {
    try {
      await axiosInstance.put(
        `/DefaultSalaryComponentDefinition/update/${id}`,
        payload
      );
      toast.success("Component updated");
      fetchComponents();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteComponent = async (id) => {
    try {
      await axiosInstance.delete(
        `/DefaultSalaryComponentDefinition/${id}`
      );
      toast.success("Component deleted");
      fetchComponents();
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [policyId]);

  return {
    components,
    loading,
    createComponent,
    updateComponent,
    deleteComponent,
    refresh: fetchComponents,
  };
}