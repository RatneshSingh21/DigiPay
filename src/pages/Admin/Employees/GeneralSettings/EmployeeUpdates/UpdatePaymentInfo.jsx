import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import { TextField, Grid, Paper, Typography } from "@mui/material";

const UPDATE_PAYMENT_ENDPOINT = (id) => `/Employee/update-payment/${id}`;

const UpdatePaymentInfo = ({ employeeId, data, onLocalUpdate }) => {
  const [form, setForm] = useState({
    bankName: data?.bankName || "",
    accountNumber: data?.accountNumber || "",
    ifscCode: data?.ifscCode || "",
    panNumber: data?.panNumber || "",
    upiId: data?.upiId || "",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put(UPDATE_PAYMENT_ENDPOINT(employeeId), form);
      toast.success("Payment details updated");
      onLocalUpdate?.(form);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payment details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      {/* Header */}
      <Grid container alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight="bold">Payment Info.</Typography>
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
          <TextField
            label="Bank Name"
            name="bankName"
            value={form.bankName}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Account Number"
            name="accountNumber"
            value={form.accountNumber}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="IFSC Code"
            name="ifscCode"
            value={form.ifscCode}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="PAN Number"
            name="panNumber"
            value={form.panNumber}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="UPI ID (optional)"
            name="upiId"
            value={form.upiId}
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

export default UpdatePaymentInfo;
