import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { registerDevice, updateDevice } from "./biometricApi";

/* ================= MACHINE CATALOG ================= */
const BIOMETRIC_MACHINE_CATALOG = [
  {
    deviceCode: "ESSL",
    deviceName: "Fingerprint Attendance Machine",
    manufacturer: "ESSL",
    deviceType: "Fingerprint",
  },
  {
    deviceCode: "BioMax",
    deviceName: "BioMax",
    manufacturer: "BioMax",
    deviceType: "Face",
  },
  {
    deviceCode: "MORX",
    deviceName: "MORX (BioFace-MSD1K)",
    manufacturer: "MIVANTA",
    deviceType: "Face",
  },
  {
    deviceCode: "ZKT-REC",
    deviceName: "Reception - Face Recognition Machine",
    manufacturer: "ZKTeco",
    deviceType: "Face",
  },
];

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const emptyForm = {
  deviceCode: "",
  deviceName: "",
  deviceType: "Fingerprint",
  manufacturer: "",
  modelNumber: "",
  serialNumber: "",
  ipAddress: "",
  port: 4370,
  locationId: 1,
  connectionType: "LAN",
  apiEndpoint: "",
  apiKey: "",
};

const RegisterMachine = ({ open, onClose, onSuccess, editDevice }) => {
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState({
    deviceCode: "",
    deviceName: "",
    deviceType: "Fingerprint",
    manufacturer: "",
    modelNumber: "",
    serialNumber: "",
    ipAddress: "",
    port: 4370,
    locationId: 1,
    connectionType: "LAN",
    apiEndpoint: "",
    apiKey: "",
  });

  /* ---------- Prefill on Edit ---------- */
  useEffect(() => {
    if (editDevice) {
      setForm({
        deviceCode: editDevice.deviceCode ?? "",
        deviceName: editDevice.deviceName ?? "",
        deviceType: editDevice.deviceType ?? "Fingerprint",
        manufacturer: editDevice.manufacturer ?? "",
        modelNumber: editDevice.modelNumber ?? "",
        serialNumber: editDevice.serialNumber ?? "",
        ipAddress: editDevice.ipAddress ?? "",
        port: editDevice.port ?? 4370,
        locationId: editDevice.locationId ?? 1,
        connectionType: editDevice.connectionType ?? "LAN",
        apiEndpoint: editDevice.apiEndpoint ?? "",
        apiKey: editDevice.apiKey ?? "",
      });

      setShowAdvanced(!!editDevice.apiEndpoint || !!editDevice.apiKey);
    } else {
      setForm(emptyForm);
      setShowAdvanced(false);
    }
  }, [editDevice]);

  if (!open) return null;

  const deviceCodeOptions = BIOMETRIC_MACHINE_CATALOG.map((m) => ({
    value: m.deviceCode,
    label: m.deviceCode,
    meta: m,
  }));

  const deviceNameOptions = BIOMETRIC_MACHINE_CATALOG.map((m) => ({
    value: m.deviceName,
    label: m.deviceName,
    meta: m,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.deviceCode || !form.deviceName || !form.ipAddress || !form.port) {
      toast.error("Device Code, Name, IP Address & Port are required");
      return;
    }

    let isSuccess = false;

    try {
      setSubmitting(true);

      if (editDevice) {
        await updateDevice(editDevice.deviceId, form);
        toast.success("Device updated successfully");
      } else {
        await registerDevice(form);
        toast.success("Device registered successfully");
      }

      isSuccess = true;
    } catch (err) {
      if (
        err?.response?.status === 409 ||
        err?.response?.status === 408 ||
        err?.message?.toLowerCase().includes("timeout")
      ) {
        toast.success("Biometric device added successfully");
        isSuccess = true;
      } else {
        toast.error("Failed to add biometric device");
      }
    } finally {
      setSubmitting(false);
      if (isSuccess) {
        onSuccess?.();
        onClose?.();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {editDevice ? "Edit Biometric Device" : "Register Biometric Device"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>
        {editDevice && (
          <div className="mb-3 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
            <strong>Device ID:</strong>{" "}
            <span className="font-mono text-gray-800">
              {editDevice.deviceId}
            </span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 text-sm"
        >
          <CreatableSelect
            options={deviceCodeOptions}
            placeholder="Device Code"
            isDisabled={!!editDevice} // DISABLE ON EDIT
            value={
              form.deviceCode
                ? { value: form.deviceCode, label: form.deviceCode }
                : null
            }
            onChange={(opt) => {
              if (!opt) return;
              setForm({
                ...form,
                deviceCode: opt.value,
                deviceName: opt.meta?.deviceName || form.deviceName,
                manufacturer: opt.meta?.manufacturer || form.manufacturer,
                deviceType: opt.meta?.deviceType || form.deviceType,
              });
            }}
            onCreateOption={(val) => setForm({ ...form, deviceCode: val })}
          />
          {editDevice && (
            <p className="col-span-2 text-[11px] text-gray-400">
              Device Code cannot be changed after registration
            </p>
          )}

          <CreatableSelect
            options={deviceNameOptions}
            placeholder="Device Name"
            value={
              form.deviceName
                ? { value: form.deviceName, label: form.deviceName }
                : null
            }
            onChange={(opt) =>
              setForm({
                ...form,
                deviceName: opt.value,
                manufacturer: opt.meta?.manufacturer || form.manufacturer,
                deviceType: opt.meta?.deviceType || form.deviceType,
              })
            }
            onCreateOption={(val) => setForm({ ...form, deviceName: val })}
          />

          <input
            className={inputClass}
            placeholder="IP Address"
            value={form.ipAddress}
            onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
          />

          <input
            type="number"
            className={inputClass}
            placeholder="Port"
            value={form.port}
            onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
          />

          <input
            placeholder="Model Number (optional)"
            value={form.modelNumber}
            onChange={(e) => setForm({ ...form, modelNumber: e.target.value })}
            className={inputClass}
          />

          <input
            placeholder="Serial Number (optional)"
            value={form.serialNumber}
            onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
            className={inputClass}
          />
          {/* INFO */}
          <div className="col-span-2 bg-gray-50 p-2 rounded text-xs text-gray-600">
            <div>
              <strong>Device Type:</strong> {form.deviceType || "-"}
            </div>
            <div>
              <strong>Manufacturer:</strong> {form.manufacturer || "-"}
            </div>
          </div>

          {/* ADVANCED TOGGLE */}
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAdvanced}
              onChange={(e) => {
                const checked = e.target.checked;
                setShowAdvanced(checked);
                if (!checked) {
                  setForm({
                    ...form,
                    apiEndpoint: "",
                    apiKey: "",
                  });
                }
              }}
              className="accent-primary cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              Use advanced connection (API / SDK)
            </span>
          </div>

          {/* ADVANCED SECTION */}
          {showAdvanced && (
            <div className="col-span-2 border-t border-gray-400 pt-3">
              <input
                placeholder="API Endpoint (eg: http://device-ip/api)"
                value={form.apiEndpoint}
                onChange={(e) =>
                  setForm({ ...form, apiEndpoint: e.target.value })
                }
                className={inputClass}
              />

              <input
                placeholder="API Key / Token"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                className={inputClass}
              />

              <p className="text-[11px] text-gray-400 mt-1">
                Required only for cloud or SDK-based biometric devices
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 bg-primary cursor-pointer text-white py-2 rounded hover:bg-secondary disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : editDevice
                ? "Update Device"
                : "Add Device"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterMachine;
