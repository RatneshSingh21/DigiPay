import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  Cpu,
  Hash,
  Server,
  MapPin,
  Wifi,
  Clock,
  Layers,
  Pencil,
  Trash2,
} from "lucide-react";
import { getBiometricDevices, deleteDevice } from "./biometricApi";
import RegisterMachine from "./RegisterMachine";
import { toast } from "react-toastify";
import ConfirmModal from "../../../../components/ConfirmModal";

const DeviceCard = ({ device, onEdit, onDelete }) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* ---------- Header ---------- */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="rounded-xl h-12 bg-blue-100 p-3 text-blue-600">
            <Cpu size={22} />
          </div>

          <div>
            <h3 className="text-lg font-semibold leading-tight">
              {device.deviceName}
            </h3>
            <p className="text-xs text-gray-500">{device.deviceCode}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(device)}
            className="rounded-lg p-2 cursor-pointer hover:bg-blue-50 text-blue-600"
            title="Edit Device"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => onDelete(device.deviceId)}
            className="rounded-lg p-2 cursor-pointer hover:bg-red-50 text-red-600"
            title="Delete Device"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ---------- Details ---------- */}
      <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
        <Info icon={<Hash size={16} />} label="Device ID">
          ID#{device.deviceId}
        </Info>
        <Info icon={<Layers size={16} />} label="Device Type">
          {device.deviceType}
        </Info>
        <Info icon={<Server size={16} />} label="Manufacturer">
          {device.manufacturer} {device.modelNumber}
        </Info>
        <Info icon={<MapPin size={16} />} label="IP Address">
          {device.ipAddress}:{device.port}
        </Info>
        <Info icon={<Wifi size={16} />} label="Connection">
          {device.connectionType}
        </Info>
        <Info icon={<Clock size={16} />} label="Last Sync">
          {device.lastSyncTime
            ? new Date(device.lastSyncTime).toLocaleString()
            : "Not synced yet"}
        </Info>
      </div>
    </div>
  );
};

/* ---------- Reusable Info Row ---------- */
const Info = ({ icon, label, children }) => (
  <div className="flex items-center gap-3">
    <span className="text-gray-400">{icon}</span>
    <span className="w-28 text-gray-500">{label}</span>
    <span className="font-medium">{children}</span>
  </div>
);

const AttendanceMachine = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    deviceId: null,
  });

  /* ---------- Fetch Devices ---------- */
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await getBiometricDevices(true);
      setDevices(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load devices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (deviceId) => {
    setConfirmDelete({
      open: true,
      deviceId,
    });
  };

  const confirmDeleteDevice = async () => {
    try {
      await deleteDevice(confirmDelete.deviceId);
      toast.success("Device deleted successfully");
      fetchDevices();
    } catch (err) {
      toast.error("Failed to delete device");
    } finally {
      setConfirmDelete({ open: false, deviceId: null });
    }
  };

  const handleEdit = (device) => {
    setEditDevice(device);
    setOpenRegister(true);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-4 py-2 shadow sticky top-14 bg-white flex justify-between items-center">
        <h2 className="font-semibold text-xl">Attendance Machines</h2>
        <div className="flex gap-3 text-sm">
          <button
            onClick={fetchDevices}
            className="flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => {
              setEditDevice(null);
              setOpenRegister(true);
            }}
            className="flex items-center gap-2 cursor-pointer rounded-lg bg-primary px-4 py-2 text-white hover:bg-secondary"
          >
            <Plus size={16} />
            Register Device
          </button>
        </div>
      </div>

      {/* ---------- Device Cards ---------- */}
      {loading ? (
        <div className="text-center text-gray-500">Loading devices...</div>
      ) : devices.length === 0 ? (
        <div className="flex items-center justify-center py-20 px-4">
          <div className="flex flex-col items-center text-center bg-white border border-dashed border-gray-300 rounded-2xl p-10 max-w-md shadow-sm">
            <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600">
              <Cpu size={32} />
            </div>

            <h3 className="text-xl font-semibold text-gray-800">
              No Attendance Machines Found
            </h3>

            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              You haven't registered any biometric devices yet. Register a
              machine to start capturing employee attendance.
            </p>

            <button
              onClick={() => {
                setEditDevice(null);
                setOpenRegister(true);
              }}
              className="mt-6 inline-flex items-center cursor-pointer gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-secondary transition"
            >
              <Plus size={16} />
              Register Device
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {devices.map((d) => (
            <DeviceCard
              key={d.deviceId}
              device={d}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ---------- Register Popup ---------- */}
      <RegisterMachine
        open={openRegister}
        onClose={() => {
          setOpenRegister(false);
          setEditDevice(null);
        }}
        onSuccess={fetchDevices}
        editDevice={editDevice}
      />

      {confirmDelete.open && (
        <ConfirmModal
          title="Delete Device"
          message="This action cannot be undone. Do you want to continue?"
          onConfirm={confirmDeleteDevice}
          onCancel={() => setConfirmDelete({ open: false, deviceId: null })}
        />
      )}
    </div>
  );
};

export default AttendanceMachine;
