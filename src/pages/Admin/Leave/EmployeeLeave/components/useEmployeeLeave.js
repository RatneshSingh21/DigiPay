import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";

export const useEmployeeLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    leaveTypeId: null,
    statusId: null,
    employeeId: null,
    fromDate: null,
    toDate: null,
  });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/EmployeeLeave");
      setLeaves(res.data?.data || res.data || []);
    } catch {
      toast.error("Failed to fetch employee leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return {
    leaves,
    loading,
    filters,
    setFilters,
    refresh: fetchLeaves,
  };
};
