import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { getBiometricDevices, getDeviceMappings } from "./biometricApi";

const StatusBadge = ({ active }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

const BiometricEmployeeMapping = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= LOAD DEVICES ================= */
  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const res = await getBiometricDevices();
      const formatted = res.data.data.map((d) => ({
        value: d.deviceId,
        label: `${d.deviceName} (${d.deviceCode})`,
        device: d,
      }));
      setDevices(formatted);
    } catch {
      toast.error("Failed to load biometric devices");
    }
  };

  /* ================= DEVICE CHANGE ================= */
  const handleDeviceChange = async (option) => {
    setSelectedDevice(option);
    setDeviceInfo(option?.device || null);
    setMappings([]);

    if (!option) return;

    try {
      setLoading(true);
      const res = await getDeviceMappings(option.value);
      setMappings(res.data?.data || []);
    } catch {
      toast.error("Failed to load employee mappings");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredMappings = useMemo(() => {
    if (!search) return mappings;
    return mappings.filter(
      (m) =>
        m.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
        m.employeeCode?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, mappings]);

  /* ================= UI ================= */
  return (
    <div className="space-y-2">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow p-5 flex flex-col justify-between items-center">
        <h1 className="text-xl font-semibold">Biometric Employee Mapping</h1>
        <p className="text-sm text-gray-500">
          View employees enrolled on each biometric device
        </p>
      </div>

      <div className="p-4 space-y-2">
        {/* DEVICE SELECT */}
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-1">
            Biometric Device
          </label>
          <Select
            options={devices}
            value={selectedDevice}
            onChange={handleDeviceChange}
            placeholder="Select biometric device..."
            isClearable
          />
        </div>

        {/* DEVICE INFO */}
        {deviceInfo && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">Device</div>
                <div className="font-semibold">{deviceInfo.deviceName}</div>
                <div className="text-xs text-gray-500">
                  IP: {deviceInfo.ipAddress}
                </div>
              </div>
              <div className="text-right">
                <StatusBadge active={deviceInfo.isActive} />
                <div className="text-xs text-gray-500 mt-1">
                  Employees: {mappings.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH */}
        {mappings.length > 0 && (
          <input
            className="border px-3 py-2 rounded w-full max-w-sm text-sm"
            placeholder="Search employee by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}

        {/* CONTENT */}
        {!selectedDevice ? (
          <p className="text-sm text-gray-500">
            Select a device to see mapped employees.
          </p>
        ) : loading ? (
          <p className="text-sm">Loading employees…</p>
        ) : filteredMappings.length === 0 ? (
          <p className="text-sm text-gray-500">No employees found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMappings.map((m) => (
              <div
                key={m.mappingId}
                className="rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{m.employeeName}</div>
                    <div className="text-xs text-gray-500">
                      {m.employeeCode}
                    </div>
                  </div>
                  <StatusBadge active={m.isActive} />
                </div>

                <div className="mt-3 text-sm space-y-1">
                  <div>
                    <span className="text-gray-500">Pay Code:</span> {m.payCode}
                  </div>
                  <div>
                    <span className="text-gray-500">Enrollment:</span>{" "}
                    {m.enrollmentType}
                  </div>
                  <div>
                    <span className="text-gray-500">Enrolled:</span>{" "}
                    {m.isEnrolled ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BiometricEmployeeMapping;
