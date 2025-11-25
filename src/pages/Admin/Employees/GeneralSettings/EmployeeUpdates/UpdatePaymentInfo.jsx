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

const GET_BANK_DETAILS = (id) => `/BankDetails/employee/${id}`;
const CREATE_BANK_DETAILS = `/BankDetails/create`;
const UPDATE_BANK_DETAILS = (bankDetailId) =>
  `/BankDetails/update/${bankDetailId}`;

const paymentModes = [
  { label: "Bank Transfer", value: "Bank Transfer" },
  { label: "Cash", value: "Cash" },
  { label: "Cheque", value: "Cheque" },
  { label: "NEFT", value: "NEFT" },
];

const accountTypeOptions = [
  { value: "Savings", label: "Savings" },
  { value: "Current", label: "Current" },
  { value: "Salary", label: "Salary" },
  { value: "Fixed Deposit", label: "Fixed Deposit" },
];

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
  const [bankDetailsExists, setBankDetailsExists] = useState(false);

  // =========================
  // FETCH BANK DETAILS
  // =========================
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const res = await axiosInstance.get(GET_BANK_DETAILS(employeeId));

        if (res.data?.length > 0) {
          const latestBank = res.data[res.data.length - 1];
          setForm({
            ...latestBank,
            employeeId,
          });

          setBankDetailsExists(true); // ← Correct
        } else {
          setBankDetailsExists(false); // ← No record exists
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // No personal details found → leave form as default for new entry
          console.warn("No Payment details found. Creating new entry.");
          setForm((prev) => ({
            ...prev,
            employeeId,
          }));
        } else {
          console.error(err);
          // toast.error("Failed to fetch bank details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, [employeeId]);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // =========================
  // SAVE (CREATE or UPDATE)
  // =========================
  const onSave = async () => {
    try {
      setSaving(true);

      // 🌟 No Bank Detail → CREATE
      if (!form.bankDetailId) {
        const res = await axiosInstance.post(CREATE_BANK_DETAILS, form);

        toast.success("Bank details created successfully!");

        if (res.data?.bankDetailId) {
          setForm((prev) => ({
            ...prev,
            bankDetailId: res.data.bankDetailId,
          }));
          setBankDetailsExists(true); // ← Switch to Update mode
        }

        onLocalUpdate?.(form);
        return;
      }

      // 🌟 Bank Detail Exists → UPDATE
      await axiosInstance.put(UPDATE_BANK_DETAILS(form.bankDetailId), form);
      toast.success("Bank details updated successfully!");

      onLocalUpdate?.(form);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to save bank details"
      );
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
        <Button variant="contained" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : bankDetailsExists ? "Update" : "Save"}
        </Button>
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
            select
          >
            {accountTypeOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
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
            select
          >
            {paymentModes.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UpdatePaymentInfo;
