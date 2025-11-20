import React, { useState, useEffect } from "react";
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
  // Dropdown data states
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [paySchedules, setPaySchedules] = useState([]);

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
    dateOfJoining: data?.dateOfJoining ? data.dateOfJoining.slice(0, 10) : "",
    aadhaarCardNumber: data?.aadhaarCardNumber || "",
  });

  const [saving, setSaving] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [depRes, desRes, locRes, payRes] = await Promise.all([
        axiosInstance.get("/Department"),
        axiosInstance.get("/Designation"),
        axiosInstance.get("/WorkLocation"),
        axiosInstance.get("/PaySchedule/all"),
      ]);

      setDepartments(depRes.data || []);
      setDesignations(desRes.data || []);
      setWorkLocations(locRes.data || []);
      setPaySchedules(payRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dropdown data");
    }
  };

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
          sx={{ borderRadius: 2, textTransform: "none" }}
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
            name="workEmail"
            value={form.workEmail}
            onChange={onChange}
            size="small"
            fullWidth
            type="email"
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
            label="Aadhar Number"
            name="aadhaarCardNumber"
            value={form.aadhaarCardNumber}
            onChange={onChange}
            size="small"
            fullWidth
            inputProps={{ maxLength: 10 }}
          />
        </Grid>

        {/* Gender */}
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={onChange}
            fullWidth
            size="small"
          >
            {genderOptions.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Department */}
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Department"
            name="departmentId"
            value={form.departmentId}
            onChange={onChange}
            fullWidth
            size="small"
          >
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Designation */}
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Designation"
            name="designationId"
            value={form.designationId}
            onChange={onChange}
            fullWidth
            size="small"
          >
            {designations.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.title}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Work Location */}
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Work Location"
            name="workLocationId"
            value={form.workLocationId}
            onChange={onChange}
            fullWidth
            size="small"
          >
            {workLocations.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                {w.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Pay Schedule */}
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Pay Schedule"
            name="payScheduleId"
            value={form.payScheduleId}
            onChange={onChange}
            fullWidth
            size="small"
          >
            {paySchedules.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Date of Joining */}
        <Grid item xs={12} md={4}>
          <TextField
            label="Date of Joining"
            type="date"
            name="dateOfJoining"
            value={form.dateOfJoining}
            onChange={onChange}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Checkboxes */}
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
