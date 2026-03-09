import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useDynamicSalaryPolicy() {
  const [policies, setPolicies] = useState([]);
  const [activePolicy, setActivePolicy] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);

      const listRes = await axiosInstance.get("/DynamicSalaryPolicy/company");

      setPolicies(listRes.data?.data || []);

      // find active policy locally
      const active = listRes.data?.data?.find((p) => p.isActive);

      setActivePolicy(active || null);
    } catch (err) {
      console.log("Error", err);
      // toast.error("Failed to fetch salary policies");
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolicy = async (payload) => {
    try {
      await axiosInstance.post("/DynamicSalaryPolicy/create", payload);
      toast.success("Policy created successfully");
      await fetchPolicies();
    } catch (err) {
      console.log("Error", err);
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };

  const activatePolicy = async (id) => {
    try {
      await axiosInstance.post(`/DynamicSalaryPolicy/activate/${id}`);
      toast.success("Policy activated");
      await fetchPolicies();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Activation failed");
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    policies,
    activePolicy,
    loading,
    createPolicy,
    activatePolicy,
    refresh: fetchPolicies,
  };
}
