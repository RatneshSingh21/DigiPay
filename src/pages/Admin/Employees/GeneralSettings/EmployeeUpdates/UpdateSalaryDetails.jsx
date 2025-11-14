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

const UPDATE_SALARY_ENDPOINT = "/Salary/update";
const GET_SALARY_ENDPOINT = (id) => `/EmployeeSalary/employee/${id}`;

const UpdateSalaryDetails = ({ employeeId, data, onLocalUpdate }) => {
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    employeeId: employeeId,
    orgId: user.userId,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),

    employeeCategory: 0,
    basicSalary: 0,
    hra: 0,
    conveyanceAllowance: 0,
    fixedAllowance: 0,
    bonus: 0,
    arrears: 0,
    overtimeHours: 0,
    overtimeRate: 0,
    leaveEncashment: 0,
    specialAllowance: 0,

    pfEmployee: 0,
    esicEmployee: 0,
    professionalTax: 0,
    tds: 0,
    loanRepayment: 0,
    otherDeductions: 0,

    absentDays: 0,
    totalWorkingDays: 0,

    status: 0,
    paymentDate: new Date().toISOString(),
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

        // toast.success("Salary loaded");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load salary details");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------
  // Handling input change
  // ---------------------------------
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value === "" ? "" : isNaN(value) ? value : Number(value),
    }));
  };

  // ---------------------------------
  // Save Handler
  // ---------------------------------
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put(UPDATE_SALARY_ENDPOINT, form);

      toast.success("Salary details updated");
      onLocalUpdate?.(form);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update salary details");
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

  // ---------------------------------
  // UI
  // ---------------------------------
  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Update Salary Details
        </Typography>

        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving}
          sx={{
            textTransform: "none",
            bgcolor: saving ? "grey.400" : "primary.main",
            "&:hover": { bgcolor: saving ? "grey.400" : "secondary.main" },
          }}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </Grid>

      {/* General Info */}
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        General Info
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} md={3}>
          <TextField
            label="Month"
            name="month"
            type="number"
            value={form.month}
            onChange={onChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={6} md={3}>
          <TextField
            label="Year"
            name="year"
            type="number"
            value={form.year}
            onChange={onChange}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Earnings */}
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
          "overtimeHours",
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
