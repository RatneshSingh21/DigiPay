import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import {
  TextField,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
} from "@mui/material";
import useAuthStore from "../../../../../store/authStore";

// API Endpoints
const CREATE_SALARY_ENDPOINT = "/EmployeeSalary/create";
const UPDATE_SALARY_ENDPOINT = "/EmployeeSalary/employee/update-salary";
const GET_SALARY_ENDPOINT = (id) => `/EmployeeSalary/employee/${id}`;

const UpdateSalaryDetails = ({ employeeId, data, onLocalUpdate }) => {
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [salaryExists, setSalaryExists] = useState(false);

  const [form, setForm] = useState({
    employeeId,
    employeeCode: data.employeeCode,
    employeeName: data.employeeName,

    basicSalary: 0,
    hra: 0,
    conveyanceAllowance: 0,
    fixedAllowance: 0,
    bonus: 0,
    arrears: 0,
    overtimeRate: 0,
    leaveEncashment: 0,
    specialAllowance: 0,

    pfEmployee: 0,
    esicEmployee: 0,
    professionalTax: 0,
    tds: 0,
    loanRepayment: 0,
    otherDeductions: 0,
  });

  // -------------------------------
  // 🚀 Fetch Salary on Component Mount
  // -------------------------------
  useEffect(() => {
    fetchEmployeeSalary();
  }, []);

  const fetchEmployeeSalary = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(GET_SALARY_ENDPOINT(employeeId));

      if (res.data?.success && res.data?.data) {
        const s = res.data.data;
        setSalaryExists(true); // ← Salary exists

        setForm((prev) => ({
          ...prev,
          basicSalary: s.basicSalary ?? 0,
          hra: s.hra ?? 0,
          conveyanceAllowance: s.conveyanceAllowance ?? 0,
          fixedAllowance: s.fixedAllowance ?? 0,
          bonus: s.bonus ?? 0,
          arrears: s.arrears ?? 0,
          overtimeRate: s.overtimeRate ?? 0,
          leaveEncashment: s.leaveEncashment ?? 0,
          specialAllowance: s.specialAllowance ?? 0,

          pfEmployee: s.pfEmployee ?? 0,
          esicEmployee: s.esicEmployee ?? 0,
          professionalTax: s.professionalTax ?? 0,
          tds: s.tds ?? 0,
          loanRepayment: s.loanRepayment ?? 0,
          otherDeductions: s.otherDeductions ?? 0,
        }));
      } else {
        setSalaryExists(false); // ← Salary does NOT exist
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // No personal details found → leave form as default for new entry
        console.warn("No Salary details found. Creating new entry.");
        setForm((prev) => ({
          ...prev,
          employeeId,
        }));
      } else {
        console.error(err);
        setSalaryExists(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------
  // Input change handler
  // ---------------------------------
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  // ---------------------------------
  // Save Handler → POST or PATCH
  // ---------------------------------
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    try {
      setSaving(true);

      if (!salaryExists) {
        // ➤ CREATE salary
        await axiosInstance.post(CREATE_SALARY_ENDPOINT, form);
        toast.success("Salary created successfully");
      } else {
        // ➤ UPDATE salary
        await axiosInstance.patch(UPDATE_SALARY_ENDPOINT, form);
        toast.success("Salary updated successfully");
      }

      onLocalUpdate?.(form);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save salary details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography>Loading salary...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          {salaryExists ? "Update Salary Details" : "Create Salary Details"}
        </Typography>

        <Button variant="contained" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : salaryExists ? "Update" : "Save"}
        </Button>
      </Grid>

      {/* Earnings Section */}
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Earnings
      </Typography>

      <Grid container spacing={2} mb={2}>
        {[
          "basicSalary",
          "hra",
          "conveyanceAllowance",
          "fixedAllowance",
          "bonus",
          "arrears",
          "overtimeRate",
          "leaveEncashment",
          "specialAllowance",
        ].map((field) => (
          <Grid item xs={6} md={3} key={field}>
            <TextField
              label={field.replace(/([A-Z])/g, " $1")}
              name={field}
              type="number"
              value={form[field]}
              onChange={onChange}
              fullWidth
              size="small"
            />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Deductions */}
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Deductions
      </Typography>

      <Grid container spacing={2} mb={2}>
        {[
          "pfEmployee",
          "esicEmployee",
          "professionalTax",
          "tds",
          "loanRepayment",
          "otherDeductions",
        ].map((field) => (
          <Grid item xs={6} md={3} key={field}>
            <TextField
              label={field.replace(/([A-Z])/g, " $1")}
              name={field}
              type="number"
              value={form[field]}
              onChange={onChange}
              fullWidth
              size="small"
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default UpdateSalaryDetails;
