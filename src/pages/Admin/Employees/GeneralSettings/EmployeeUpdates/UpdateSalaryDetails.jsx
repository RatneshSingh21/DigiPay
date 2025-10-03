import React, { useState } from "react";
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

const UpdateSalaryDetails = ({ employeeId, data, onLocalUpdate }) => {
  const { user } = useAuthStore(); // move hook inside component

  const [form, setForm] = useState({
    employeeId: employeeId, // stays in payload, not in UI
    orgId: user.userId,     // stays in payload, not in UI
    month: data?.month || new Date().getMonth() + 1,
    year: data?.year || new Date().getFullYear(),
    employeeCategory: data?.employeeCategory || 0,
    basicSalary: data?.basicSalary || 0,
    hra: data?.hra || 0,
    conveyanceAllowance: data?.conveyanceAllowance || 0,
    fixedAllowance: data?.fixedAllowance || 0,
    bonus: data?.bonus || 0,
    arrears: data?.arrears || 0,
    overtimeHours: data?.overtimeHours || 0,
    overtimeRate: data?.overtimeRate || 0,
    leaveEncashment: data?.leaveEncashment || 0,
    specialAllowance: data?.specialAllowance || 0,
    pfEmployee: data?.pfEmployee || 0,
    esicEmployee: data?.esicEmployee || 0,
    professionalTax: data?.professionalTax || 0,
    tds: data?.tds || 0,
    loanRepayment: data?.loanRepayment || 0,
    otherDeductions: data?.otherDeductions || 0,
    absentDays: data?.absentDays || 0,
    totalWorkingDays: data?.totalWorkingDays || 0,
    status: data?.status || 0,
    paymentDate: data?.paymentDate || new Date().toISOString(),
  });

  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value === "" ? "" : isNaN(value) ? value : Number(value),
    }));
  };

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

      <Divider sx={{ my: 2 }} />

      {/* Attendance */}
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Attendance
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} md={3}>
          <TextField
            label="Absent Days"
            name="absentDays"
            type="number"
            value={form.absentDays}
            onChange={onChange}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            label="Total Working Days"
            name="totalWorkingDays"
            type="number"
            value={form.totalWorkingDays}
            onChange={onChange}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UpdateSalaryDetails;
