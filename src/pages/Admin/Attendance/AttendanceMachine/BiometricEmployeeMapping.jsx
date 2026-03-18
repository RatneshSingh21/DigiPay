import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { Hash, Type, Link } from "lucide-react";
import { getBiometricDevices, getDeviceMappings } from "./biometricApi";
import MapEmployeeModal from "./MapEmployeeModal";

/* ================= STATUS BADGE ================= */
const StatusBadge = ({ active }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-medium ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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

  const [showMapModal, setShowMapModal] = useState(false);
  const [showPayCodePrompt, setShowPayCodePrompt] = useState(false);
  const [payCodeMode, setPayCodeMode] = useState(null); // numeric | alphanumeric

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
    <div className="space-y-3">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow p-5 text-center">
        <h1 className="text-xl font-semibold">Biometric Employee Mapping</h1>
        <p className="text-sm text-gray-500">
          View and manage employees mapped to biometric devices
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* DEVICE SELECT */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="max-w-md w-full">
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

          <button
            disabled={!selectedDevice}
            onClick={() => setShowPayCodePrompt(true)}
            className="bg-primary text-white px-4 py-2 rounded cursor-pointer text-sm hover:bg-secondary disabled:opacity-50"
          >
            Map Employee
          </button>
        </div>

        {/* DEVICE INFO */}
        {deviceInfo && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 rounded-lg p-4">
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
            className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search employee by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}

        {/* CONTENT */}
        {!selectedDevice ? (
          <p className="text-sm text-gray-500">
            Select a device to view mapped employees.
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
                    <span className="text-gray-500">Machine PayCode:</span>{" "}
                    {m.payCode}
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

      {/* PAYCODE PROMPT */}
      {showPayCodePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-h-[80vh] max-w-md px-6 py-2 space-y-5 animate-scaleIn">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Choose PayCode Format
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Select how the PayCode should be sent to the biometric device.
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Numeric */}
              <button
                className="group w-full border text-sm border-gray-200 rounded-xl p-4 text-left transition-all hover:border-blue-400 hover:bg-blue-50 focus:outline-none"
                onClick={() => {
                  setPayCodeMode("numeric");
                  setShowPayCodePrompt(false);
                  setShowMapModal(true);
                }}
              >
                <div className="flex items-start gap-3 cursor-pointer">
                  <div className="rounded-lg bg-blue-100 text-blue-600 p-2">
                    <Hash size={18} />
                  </div>

                  <div>
                    <div className="font-medium text-gray-800">
                      Numeric only
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Only numbers will be sent to the device
                      <span className="block mt-0.5">
                        Example: <b>PMSD123</b> → <b>123</b>
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Alphanumeric */}
              <button
                className="group w-full border text-sm border-gray-200 rounded-xl p-4 text-left transition-all hover:border-green-400 hover:bg-green-50 focus:outline-none"
                onClick={() => {
                  setPayCodeMode("alphanumeric");
                  setShowPayCodePrompt(false);
                  setShowMapModal(true);
                }}
              >
                <div className="flex items-start gap-3 cursor-pointer">
                  <div className="rounded-lg bg-green-100 text-green-600 p-2">
                    <Type size={18} />
                  </div>

                  <div>
                    <div className="font-medium text-gray-800">
                      Full employee code
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Complete code will be sent as-is
                      <span className="block mt-0.5">
                        Example: <b>PMSD123</b> → <b>PMSD123</b>
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* HYPHENATED */}
              <button
                className="group w-full border text-sm border-gray-200 rounded-xl p-4 text-left transition-all hover:border-purple-400 hover:bg-purple-50 focus:outline-none"
                onClick={() => {
                  setPayCodeMode("hyphenated");
                  setShowPayCodePrompt(false);
                  setShowMapModal(true);
                }}
              >
                <div className="flex items-start gap-3 cursor-pointer">
                  <div className="rounded-lg bg-purple-100 text-purple-600 p-2">
                    <Link size={18} />
                  </div>

                  <div>
                    <div className="font-medium text-gray-800">
                      Prefix + hyphen + number
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Prefix remains, number is hyphenated
                      <span className="block mt-0.5">
                        Example: <b>PMSD0099</b> → <b>PMSD-0099</b>
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowPayCodePrompt(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 cursor-pointer text-sm font-medium text-gray-600 
               hover:bg-gray-100 hover:text-gray-800 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAP MODAL */}
      <MapEmployeeModal
        open={showMapModal}
        onClose={() => setShowMapModal(false)}
        deviceId={selectedDevice?.value}
        payCodeMode={payCodeMode}
        onSuccess={() => handleDeviceChange(selectedDevice)}
      />
    </div>
  );
};

export default BiometricEmployeeMapping;
