import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";

const UPDATE_BASIC_ENDPOINT = (id) => `/Employee/${id}`;

const genderOptions = ["Male", "Female", "Other"];

const UpdateBasicDetails = ({ employeeId, data, onLocalUpdate }) => {
  const [form, setForm] = useState({
    fullName: data?.fullName || "",
    employeeCode: data?.employeeCode || "",
    workEmail: data?.workEmail || "",
    mobileNumber: data?.mobileNumber || "",
    departmentId: data?.departmentId || "",
    designationId: data?.designationId || "",
    workLocationId: data?.workLocationId || "",
    payScheduleId: data?.payScheduleId || "",
    gender: data?.gender || "",
    isDirector: data?.isDirector ?? false,
    portalAccessEnabled: data?.portalAccessEnabled ?? true,
    dateOfJoining: data?.dateOfJoining
      ? data.dateOfJoining.slice(0, 10)
      : "",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onCheckboxChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.checked }));

  const onSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put(UPDATE_BASIC_ENDPOINT(employeeId), form);
      toast.success("Employee details updated");
      onLocalUpdate?.(form);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update employee details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }} elevation={3}>
      {/* Header */}
      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Employee Details
        </Typography>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving}
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </Grid>

      {/* Form */}
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
            label="Mobile Number"
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={onChange}
            size="small"
            fullWidth
            inputProps={{ maxLength: 10 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={onChange}
            size="small"
            fullWidth
          >
            {genderOptions.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Department ID"
            name="departmentId"
            value={form.departmentId}
            onChange={onChange}
            size="small"
            fullWidth
            type="number"
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
            type="number"
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
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Pay Schedule ID"
            name="payScheduleId"
            value={form.payScheduleId}
            onChange={onChange}
            size="small"
            fullWidth
            type="number"
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
        <Grid item xs={12} md={4} display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isDirector}
                onChange={onCheckboxChange}
                name="isDirector"
              />
            }
            label="Is Director"
          />
        </Grid>
        <Grid item xs={12} md={4} display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={form.portalAccessEnabled}
                onChange={onCheckboxChange}
                name="portalAccessEnabled"
              />
            }
            label="Portal Access Enabled"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UpdateBasicDetails;
