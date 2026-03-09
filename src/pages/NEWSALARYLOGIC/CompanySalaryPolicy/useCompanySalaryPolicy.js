import { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useCompanySalaryPolicy() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCompanyPolicies = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/CompanySalaryPolicy/company");
      setPolicies(res.data?.data || []);
    } catch (err) {
      console.log("Error", err);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async (payload) => {
    try {
      await axiosInstance.post("/CompanySalaryPolicy/create", payload);
      toast.success("Company salary policy created successfully");
      fetchCompanyPolicies();
      return true;
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to create company salary policy",
      );
      return false;
    }
  };

  const updatePolicy = async (id, payload) => {
    try {
      await axiosInstance.put(`/CompanySalaryPolicy/update/${id}`, payload);
      toast.success("Policy updated successfully");
      fetchCompanyPolicies();
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update policy");
      return false;
    }
  };

  const deletePolicy = async (id) => {
    try {
      await axiosInstance.delete(`/CompanySalaryPolicy/${id}`);
      toast.success("Policy deleted successfully");
      fetchCompanyPolicies();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete policy");
    }
  };

  const activatePolicy = async (id) => {
    try {
      await axiosInstance.post(`/CompanySalaryPolicy/activate/${id}`);
      toast.success("Policy activated successfully");
      fetchCompanyPolicies();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to activate policy");
    }
  };

  useEffect(() => {
    fetchCompanyPolicies();
  }, []);

  return {
    policies,
    loading,
    createPolicy,
    updatePolicy,
    deletePolicy,
    activatePolicy,
  };
}
