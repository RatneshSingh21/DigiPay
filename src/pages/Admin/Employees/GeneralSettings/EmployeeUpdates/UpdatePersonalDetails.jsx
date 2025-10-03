import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import {
  TextField,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";

const GET_PERSONAL_ENDPOINT = (id) => `/PersonalDetails/${id}`;
const UPDATE_PERSONAL_ENDPOINT = `/PersonalDetails/update`;

const UpdatePersonalDetails = ({ employeeId, onLocalUpdate }) => {
  const [form, setForm] = useState({
    employeeId,
    dateOfBirth: "",
    fatherName: "",
    pan: "",
    differentlyAbledType: "",
    personalEmailAddress: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch personal details on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(GET_PERSONAL_ENDPOINT(employeeId));
        if (res.data) {
          setForm((prev) => ({
            ...prev,
            ...res.data,
            employeeId, // always ensure employeeId is present
            dateOfBirth: res.data.dateOfBirth
              ? res.data.dateOfBirth.slice(0, 10)
              : "",
          }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch personal details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put(UPDATE_PERSONAL_ENDPOINT, form);
      toast.success("Personal details updated");
      onLocalUpdate?.(form);
    } catch (err) {
      console.error(err);
      // toast.error("Failed to update personal details");
      console.log("Failed to update personal details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress size={28} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      {/* Header */}
      <Grid container alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Personal Details
        </Typography>
        <button
          onClick={onSave}
          disabled={saving}
          className={`px-4 py-1.5 rounded-lg font-medium text-white transition-all duration-200
        ${
          saving
            ? "bg-gray-400 cursor-not-allowed shadow-none"
            : "bg-primary hover:bg-secondary shadow-md hover:shadow-lg"
        } 
        normal-case`}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </Grid>

      {/* Form */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Father's Name"
            name="fatherName"
            value={form.fatherName}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="PAN"
            name="pan"
            value={form.pan}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>Differently Abled Type</InputLabel>
            <Select
              name="differentlyAbledType"
              value={form.differentlyAbledType}
              onChange={onChange}
              label="Differently Abled Type"
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="None">None</MenuItem>
              <MenuItem value="Visually Impaired">Visually Impaired</MenuItem>
              <MenuItem value="Hearing Impaired">Hearing Impaired</MenuItem>
              <MenuItem value="Locomotor Disability">Locomotor Disability</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Personal Email"
            name="personalEmailAddress"
            value={form.personalEmailAddress}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Address Line 1"
            name="addressLine1"
            value={form.addressLine1}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Address Line 2"
            name="addressLine2"
            value={form.addressLine2}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="City"
            name="city"
            value={form.city}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="State"
            name="state"
            value={form.state}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Pin Code"
            name="pinCode"
            value={form.pinCode}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UpdatePersonalDetails;
