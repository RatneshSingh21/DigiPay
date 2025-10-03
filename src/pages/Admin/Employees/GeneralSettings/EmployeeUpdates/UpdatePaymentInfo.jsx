import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import {
  TextField,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";

const GET_BANK_DETAILS = (id) => `/BankDetails/employee/${id}`;
const UPDATE_BANK_DETAILS = (bankDetailId) => `/BankDetails/${bankDetailId}`;

const UpdatePaymentInfo = ({ employeeId, onLocalUpdate }) => {
  const [form, setForm] = useState({
    bankDetailId: null,
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "",
    branchName: "",
    branchAddress: "",
    accountHolderName: "",
    paymentMode: "",
    employeeId,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch bank details on mount
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const res = await axiosInstance.get(GET_BANK_DETAILS(employeeId));
        if (res.data?.statusCode === 200 && res.data.data?.length > 0) {
          const bankDetails = res.data.data[0]; // extract the first bank detail
          setForm((prev) => ({
            ...prev,
            ...bankDetails,
            employeeId, // keep employeeId
          }));
        } else {
          // toast.info("No bank details found for this employee");
          console.log("No bank details found for this employee");
          
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch bank details");
      } finally {
        setLoading(false);
      }
    };
    fetchBankDetails();
  }, [employeeId]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = async () => {
    if (!form.bankDetailId) {
      toast.error("Bank detail ID missing — cannot update");
      return;
    }
    try {
      setSaving(true);
      await axiosInstance.put(UPDATE_BANK_DETAILS(form.bankDetailId), form);
      toast.success("Bank details updated successfully");
      onLocalUpdate?.(form);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update bank details");
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
          Payment Info
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
            label="Account Type"
            name="accountType"
            value={form.accountType}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
            placeholder="Savings / Current"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Branch Name"
            name="branchName"
            value={form.branchName}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Branch Address"
            name="branchAddress"
            value={form.branchAddress}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Account Holder Name"
            name="accountHolderName"
            value={form.accountHolderName}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Payment Mode"
            name="paymentMode"
            value={form.paymentMode}
            onChange={onChange}
            fullWidth
            size="small"
            margin="dense"
            placeholder="e.g. Bank Transfer, UPI"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UpdatePaymentInfo;
