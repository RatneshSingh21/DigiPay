import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

const UPDATE_BASIC_ENDPOINT = (id) => `/Employee/${id}`;

const UpdateBasicDetails = ({ employeeId, data, onLocalUpdate }) => {
  const [form, setForm] = useState({
    fullName: data?.fullName || "",
    employeeCode: data?.employeeCode || "",
    workEmail: data?.workEmail || "",
    departmentId: data?.departmentId || "",
    designationId: data?.designationId || "",
    workLocationId: data?.workLocationId || "",
    dateOfJoining: data?.dateOfJoining?.slice(0, 10) || "",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put(UPDATE_BASIC_ENDPOINT(employeeId), form);
      toast.success("Basic details updated");
      onLocalUpdate?.(form);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update basic details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }} elevation={3}>
      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Basic Details
        </Typography>
        <button
          onClick={onSave}
          disabled={saving}
          className={`px-4 py-1.5 rounded-lg font-medium text-white transition-all duration-200
        ${saving
          ? "bg-gray-400 cursor-not-allowed shadow-none"
          : "bg-primary hover:bg-secondary shadow-md hover:shadow-lg"
        } 
        normal-case`}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Employee Code"
            name="employeeCode"
            value={form.employeeCode}
            onChange={onChange}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Work Email"
            type="email"
            name="workEmail"
            value={form.workEmail}
            onChange={onChange}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Department ID"
            name="departmentId"
            value={form.departmentId}
            onChange={onChange}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Designation ID"
            name="designationId"
            value={form.designationId}
            onChange={onChange}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Work Location ID"
            name="workLocationId"
            value={form.workLocationId}
            onChange={onChange}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Date of Joining"
            type="date"
            name="dateOfJoining"
            value={form.dateOfJoining}
            onChange={onChange}
            size="small"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UpdateBasicDetails;
