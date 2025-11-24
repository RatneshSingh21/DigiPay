import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import {
  TextField,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  MenuItem,
  Button,
} from "@mui/material";

const GET_PERSONAL_ENDPOINT = (id) => `/PersonalDetails/${id}`;
const UPDATE_PERSONAL_ENDPOINT = `/PersonalDetails/update`;
const SAVE_PERSONAL_ENDPOINT = `/PersonalDetails/save`;

// -----------------------------
// OPTIONS
// -----------------------------
const differentlyAbledOptions = [
  "None",
  "Visually Impaired",
  "Hearing Impaired",
  "Locomotor Disability",
  "Other",
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Lakshadweep",
  "Puducherry",
];

// ------------------------------------------------
// COMPONENT
// ------------------------------------------------
const UpdatePersonalDetails = ({ employeeId, onLocalUpdate }) => {
  const [form, setForm] = useState({
    employeePersonalDetailsId: 0,
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
  const [personalDetailsExists, setPersonalDetailsExists] = useState(false);

  // ===============================
  // FETCH PERSONAL DETAILS
  // ===============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(GET_PERSONAL_ENDPOINT(employeeId));

        if (res.data) {
          setPersonalDetailsExists(true);
          setForm({
            ...res.data,
            employeeId,
            dateOfBirth: res.data.dateOfBirth
              ? res.data.dateOfBirth.slice(0, 10)
              : "",
          });
        } else {
          setPersonalDetailsExists(false); // ← Personal Details does NOT exist
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // No personal details found → leave form as default for new entry
          console.warn("No personal details found. Creating new entry.");
          setForm((prev) => ({
            ...prev,
            employeeId,
          }));
        } else {
          console.error(err);
          toast.error("Failed to fetch personal details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  // ------------------------------
  // INPUT CHANGE HANDLER
  // ------------------------------
  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ------------------------------
  // SAVE API CALL
  // ------------------------------
  const onSave = async () => {
    try {
      setSaving(true);

      if (!personalDetailsExists || form.employeePersonalDetailsId === 0) {
        // CREATE
        const res = await axiosInstance.post(SAVE_PERSONAL_ENDPOINT, form);
        toast.success("Personal details saved");

        onLocalUpdate?.(res.data);

        if (res.data?.employeePersonalDetailsId) {
          setForm((prev) => ({
            ...prev,
            employeePersonalDetailsId: res.data.employeePersonalDetailsId,
          }));
          setPersonalDetailsExists(true);
        }
      } else {
        // UPDATE
        await axiosInstance.put(UPDATE_PERSONAL_ENDPOINT, form);
        toast.success("Personal details updated");
        onLocalUpdate?.(form);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save personal details");
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
        <Button variant="contained" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : personalDetailsExists ? "Update" : "Save"}
        </Button>
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
            inputProps={{ style: { textTransform: "uppercase" } }}
          />
        </Grid>

        {/* Differently Abled Type - MUI SELECT */}
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Differently Abled Type"
            name="differentlyAbledType"
            value={form.differentlyAbledType}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          >
            <MenuItem value="">Select</MenuItem>
            {differentlyAbledOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
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

        {/* Address Line 1 */}
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

        {/* Address Line 2 */}
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

        {/* City */}
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

        {/* State - MUI SELECT */}
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="State"
            name="state"
            value={form.state}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          >
            <MenuItem value="">Select</MenuItem>
            {indianStates.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Pin Code */}
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
