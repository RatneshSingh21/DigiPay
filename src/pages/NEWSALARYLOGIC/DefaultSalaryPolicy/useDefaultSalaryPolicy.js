import { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useDefaultSalaryPolicy() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/DefaultSalaryPolicy/all");
      setPolicies(res.data?.data || []);
    } catch (err) {
      console.log("Error" ,err)
      // toast.error("Failed to fetch salary policies");
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async (payload) => {
    try {
      await axiosInstance.post("/DefaultSalaryPolicy/create", payload);
      toast.success("Policy created successfully");
      fetchPolicies();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create policy");
    }
  };

  const updatePolicy = async (id, payload) => {
    try {
      await axiosInstance.put(`/DefaultSalaryPolicy/update/${id}`, payload);
      toast.success("Policy updated successfully");
      fetchPolicies();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update policy");
    }
  };

  const deletePolicy = async (id) => {
    try {
      await axiosInstance.delete(`/DefaultSalaryPolicy/${id}`);
      toast.success("Policy deleted successfully");
      fetchPolicies();
    } catch (err) {
      toast.error("Failed to delete policy");
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return {
    policies,
    loading,
    createPolicy,
    updatePolicy,
    deletePolicy,
    refresh: fetchPolicies,
  };
}