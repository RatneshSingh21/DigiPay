import React, { useState } from "react";
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
} from "@mui/material";

const UPDATE_PERSONAL_ENDPOINT = (id) => `/Employee/update-personal/${id}`;

const UpdatePersonalDetails = ({ employeeId, data, onLocalUpdate }) => {
  const [form, setForm] = useState({
    gender: data?.gender || "",
    mobileNumber: data?.mobileNumber || "",
    dateOfBirth: data?.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
    addressLine1: data?.addressLine1 || "",
    addressLine2: data?.addressLine2 || "",
    city: data?.city || "",
    state: data?.state || "",
    pincode: data?.pincode || "",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put(UPDATE_PERSONAL_ENDPOINT(employeeId), form);
      toast.success("Personal details updated");
      onLocalUpdate?.(form);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update personal details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      {/* Header */}
      <Grid container alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight="bold">Personal Details</Typography>
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

      {/* Form */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={form.gender}
              onChange={onChange}
              label="Gender"
            >
              <MenuItem value="">Select Gender</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Mobile Number"
            name="mobileNumber"
            value={form.mobileNumber}
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
            label="Pincode"
            name="pincode"
            value={form.pincode}
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
