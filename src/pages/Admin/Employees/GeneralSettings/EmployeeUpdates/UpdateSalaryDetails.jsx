import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import {
  TextField,
  Select,
  MenuItem,
  Paper,
  Typography,
  Grid,
  InputLabel,
  FormControl,
} from "@mui/material";

const UPDATE_SALARY_ENDPOINT = (id) => `/Salary/update-by-employee/${id}`;

const toFixedOrEmpty = (v) =>
  v === null || v === undefined || v === "" ? "" : Number(v);

const UpdateSalaryDetails = ({ employeeId, data, onLocalUpdate }) => {
  const [form, setForm] = useState({
    ctc: toFixedOrEmpty(data?.ctc),
    payScheduleId: data?.payScheduleId || "",
    salaryBasedOn: data?.salaryBasedOn || "Monthly",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "ctc" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const onSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put(UPDATE_SALARY_ENDPOINT(employeeId), form);
      toast.success("Salary details updated");
      onLocalUpdate?.(form);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update salary details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      {/* Header */}
      <Grid container alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Salary Details
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
            label="CTC"
            name="ctc"
            type="number"
            value={form.ctc}
            onChange={onChange}
            size="small"
            fullWidth
            inputProps={{ step: "0.01" }}
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
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl size="small" fullWidth>
            <InputLabel>Salary Based On</InputLabel>
            <Select
              name="salaryBasedOn"
              value={form.salaryBasedOn}
              onChange={onChange}
              label="Salary Based On"
            >
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Hourly">Hourly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UpdateSalaryDetails;
