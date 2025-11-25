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

const EMPLOYEE_API = (id) => `/Employee/${id}`;
const genderOptions = ["Male", "Female", "Other"];

export default function UpdateBasicDetails({ employeeId, onLocalUpdate }) {
  // Dropdown data
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [paySchedules, setPaySchedules] = useState([]);

  // Form
  const [form, setForm] = useState({
    employeeCode: "",
    fullName: "",
    dateOfJoining: "",
    workEmail: "",
    mobileNumber: "",
    isDirector: false,
    gender: "",
    departmentId: "",
    designationId: "",
    workLocationId: "",
    payScheduleId: "",
    portalAccessEnabled: true,
    aadhaarCardNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [basicDetailsExists, setBasicDetailsExists] = useState(false);

  // ---------------------------
  //  FETCH DROPDOWNS
  // ---------------------------
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
      toast.error("Failed loading dropdown data");
    }
  };

  // ---------------------------
  //  GET EMPLOYEE DATA
  // ---------------------------
  const fetchEmployee = async () => {
    try {
      const res = await axiosInstance.get(EMPLOYEE_API(employeeId));
      const emp = res.data.data;

      setForm({
        employeeCode: emp.employeeCode || "",
        fullName: emp.fullName || "",
        dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.slice(0, 10) : "",
        workEmail: emp.workEmail || "",
        mobileNumber: emp.mobileNumber || "",
        isDirector: emp.isDirector ?? false,
        gender: emp.gender || "",
        departmentId: emp.departmentId ? Number(emp.departmentId) : "",
        designationId: emp.designationId ? Number(emp.designationId) : "",
        workLocationId: emp.workLocationId ? Number(emp.workLocationId) : "",
        payScheduleId: emp.payScheduleId ? Number(emp.payScheduleId) : "",
        portalAccessEnabled: emp.portalAccessEnabled ?? true,
        aadhaarCardNumber: emp.aadhaarCardNumber || "",
      });
      setBasicDetailsExists(true);
    } catch (err) {
      if (err.response?.status === 404) {
        // No personal details found → leave form as default for new entry
        console.warn("No Basic details found. Creating new entry.");
        setForm((prev) => ({
          ...prev,
          employeeId,
        }));
      } else {
        console.error(err);
        toast.error("Failed to fetch employee");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  //  ON MOUNT → LOAD DROPDOWNS + EMPLOYEE
  // ---------------------------
  useEffect(() => {
    const loadData = async () => {
      await fetchDropdowns();
      await fetchEmployee();
    };

    loadData();
  }, [employeeId]);

  // ---------------------------
  //  FORM EVENTS
  // ---------------------------
  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onCheckboxChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.checked }));

  // ---------------------------
  //  UPDATE API
  // ---------------------------
  const onSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put(EMPLOYEE_API(employeeId), form);
      toast.success("Employee updated successfully!");

      // Update parent if needed
      onLocalUpdate?.(form);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Typography>Loading…</Typography>;

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }} elevation={3}>
      <Grid container justifyContent="space-between" mb={2}>
        <Typography variant="h6">Employee Details</Typography>
        <Button variant="contained" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : basicDetailsExists ? "Update" : "Save"}
        </Button>
      </Grid>

      <Grid container spacing={2}>
        {/* Full Name */}
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

        {/* Employee Code */}
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

        {/* Work Email */}
        <Grid item xs={12} md={4}>
          <TextField
            label="Work Email"
            name="workEmail"
            value={form.workEmail}
            onChange={onChange}
            size="small"
            type="email"
            fullWidth
          />
        </Grid>

        {/* Mobile */}
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

        {/* Aadhaar */}
        <Grid item xs={12} md={4}>
          <TextField
            label="Aadhaar Number"
            name="aadhaarCardNumber"
            value={form.aadhaarCardNumber}
            onChange={onChange}
            size="small"
            fullWidth
            inputProps={{ maxLength: 12 }}
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

        {/* Department */}
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Department"
            name="departmentId"
            value={form.departmentId}
            onChange={onChange}
            size="small"
            fullWidth
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
            size="small"
            fullWidth
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
            size="small"
            fullWidth
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
            size="small"
            fullWidth
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
        <Grid item xs={12} md={4}>
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

        <Grid item xs={12} md={4}>
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
}
