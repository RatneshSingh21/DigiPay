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

const emptyForm = {
  deviceCode: "",
  deviceName: "",
  ipAddress: "",
  port: 4370,
  deviceType: "Fingerprint",
  manufacturer: "",
  connectionType: "LAN",
  locationId: 1,
};

const RegisterMachine = ({ open, onClose, onSuccess, editDevice }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  /* ---------- Prefill on Edit ---------- */
  useEffect(() => {
    if (editDevice) {
      setForm({
        deviceCode: editDevice.deviceCode,
        deviceName: editDevice.deviceName,
        ipAddress: editDevice.ipAddress,
        port: editDevice.port,
        deviceType: editDevice.deviceType,
        manufacturer: editDevice.manufacturer,
        connectionType: editDevice.connectionType,
        locationId: editDevice.locationId,
      });
    } else {
      setForm(emptyForm);
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

    if (!form.deviceCode || !form.deviceName || !form.ipAddress) {
      toast.error("Device Code, Name & IP Address are required");
      return;
    }

    try {
      setSubmitting(true);

      if (editDevice) {
        await updateDevice(editDevice.deviceId, form);
        toast.success("Device updated successfully");
      } else {
        await registerDevice(form);
        toast.success("Device registered successfully");
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error("Failed to save device");
      console.error(err);
    } finally {
      setSubmitting(false);
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 text-sm"
        >
          <CreatableSelect
            options={deviceCodeOptions}
            placeholder="Device Code"
            value={
              form.deviceCode
                ? { value: form.deviceCode, label: form.deviceCode }
                : null
            }
            onChange={(opt) =>
              setForm({
                ...form,
                deviceCode: opt.value,
                deviceName: opt.meta?.deviceName || form.deviceName,
                manufacturer: opt.meta?.manufacturer || form.manufacturer,
                deviceType: opt.meta?.deviceType || form.deviceType,
              })
            }
            onCreateOption={(val) => setForm({ ...form, deviceCode: val })}
          />

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
            className="border rounded px-3 py-2"
            placeholder="IP Address"
            value={form.ipAddress}
            onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
          />

          <input
            type="number"
            className="border rounded px-3 py-2"
            placeholder="Port"
            value={form.port}
            onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
          />

          <div className="col-span-2 bg-gray-50 p-2 rounded text-xs text-gray-600">
            <div>
              <strong>Device Type:</strong> {form.deviceType || "-"}
            </div>
            <div>
              <strong>Manufacturer:</strong> {form.manufacturer || "-"}
            </div>
          </div>

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
