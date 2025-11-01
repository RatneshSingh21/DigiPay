import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import { toast } from "react-toastify";
import { FaTrain } from "react-icons/fa";

const EmpTravel = () => {
  const User = useAuthStore((state) => state.user);
  const [isJourneyStarted, setIsJourneyStarted] = useState(false);
  const [travelId, setTravelId] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [travelList, setTravelList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // 🔹 Get current geolocation
  const getLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation not supported");
        reject("Geolocation not supported");
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (err) => {
          toast.error("Failed to get location");
          reject(err);
        }
      );
    });
  };

  // 🔹 Convert coordinates → readable address
  const getAddressFromCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      return data.display_name || "Unknown location";
    } catch {
      return "Unknown location";
    }
  };

  // 🟢 Start Journey
  const handleStartJourney = async () => {
    if (!purpose.trim()) return toast.warning("Enter travel purpose");

    try {
      setLoading(true);
      const { latitude, longitude } = await getLocation();
      const address = await getAddressFromCoords(latitude, longitude);

      const payload = {
        startLatitude: latitude,
        startLongitude: longitude,
        startAddress: address,
        startDate: new Date().toISOString(),
        endLatitude: 0,
        endLongitude: 0,
        endAddress: "",
        endDate: null,
        purpose: purpose.trim(),
        deviceInfo: navigator.userAgent,
        ipAddress: "Fetching...",
      };

      const res = await axiosInstance.post(
        "/EmployeeTravelLocation/create",
        payload
      );
      if (res.data?.success) {
        toast.success("Journey started successfully!");
        setIsJourneyStarted(true);
        setTravelId(res.data.data?.id || null);
        fetchTravelList();
      }
    } catch (err) {
      toast.error("Error starting journey");
    } finally {
      setLoading(false);
    }
  };

  // 🔴 End Journey
  const handleEndJourney = async () => {
    if (!travelId) return toast.error("No active journey found");

    try {
      setLoading(true);
      const { latitude, longitude } = await getLocation();
      const address = await getAddressFromCoords(latitude, longitude);

      const payload = {
        endLatitude: latitude,
        endLongitude: longitude,
        endAddress: address,
        endDate: new Date().toISOString(),
        purpose: `${purpose.trim()} (Completed)`,
        deviceInfo: navigator.userAgent,
        ipAddress: "Fetching...",
      };

      const res = await axiosInstance.put(
        `/EmployeeTravelLocation/update/${travelId}`,
        payload
      );
      if (res.data?.success) {
        toast.success("Journey ended successfully!");
        setIsJourneyStarted(false);
        setPurpose("");
        setTravelId(null);
        fetchTravelList();
      }
    } catch (err) {
      toast.error("Error ending journey");
    } finally {
      setLoading(false);
    }
  };

  // 📜 Fetch Travel History
  const fetchTravelList = async () => {
    if (!User?.userId) return;
    setListLoading(true);
    try {
      const res = await axiosInstance.get(
        `/EmployeeTravelLocation/employee/${User.userId}`
      );
      if (res.data?.success) setTravelList(res.data.data || []);
    } catch {
      toast.error("Error fetching travel records");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelList();
  }, [User?.userId]);

  return (
    <div className="max-w-5xl mx-auto px-6 mt-4">
      <h2 className="text-2xl font-bold justify-center flex items-center gap-2 text-blue-700 mb-2">
        <FaTrain />
        Employee Travel Tracker
      </h2>

      {/* Travel Form Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {isJourneyStarted ? "End Your Journey" : "Start a New Journey"}
        </h3>

        {!isJourneyStarted && (
          <div className="mb-4">
            <label className="block text-gray-600 mb-2 font-medium">
              Purpose of Travel
            </label>
            <input
              type="text"
              placeholder="e.g. Client Meeting at Delhi"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
          <p className="text-gray-600 text mb-3:mb-0">
            {isJourneyStarted
              ? "Your journey is currently active."
              : "Enter purpose and start your journey."}
          </p>

          {!isJourneyStarted ? (
            <button
              onClick={handleStartJourney}
              disabled={loading}
              className="bg-primary cursor-pointer hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-60"
            >
              {loading ? "Starting..." : "Start Journey"}
            </button>
          ) : (
            <button
              onClick={handleEndJourney}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 cursor-pointer text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-60"
            >
              {loading ? "Ending..." : "End Journey"}
            </button>
          )}
        </div>
      </div>

      {/* Travel History Card */}
      <div className="bg-white shadow-lg rounded-2xl px-6 py-3 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🧭 Travel History
        </h3>

        {listLoading ? (
          <p className="text-gray-500 text-center">Loading travel records...</p>
        ) : travelList.length === 0 ? (
          <p className="text-gray-500 text-center">No travel records found.</p>
        ) : (
          <div className="overflow-x-auto shadow h-[200px] overflow-y-scroll">
            <table className="min-w-full divide-y text-xs divide-gray-200 text-center">
              <thead className="bg-blue-50 text-blue-800 uppercase tracking-wide">
                <tr>
                  <th className="px-2 py-3">S.No</th>
                  <th className="px-2 py-3">Purpose</th>
                  <th className="px-2 py-3">Start</th>
                  <th className="px-2 py-3">End</th>
                  <th className="px-2 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {travelList.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50`}
                  >
                    <td className="px-2 py-3 text-gray-500">{index + 1}.</td>

                    <td className="px-2 py-3 font-medium text-gray-800">
                      {item.purpose}
                      {/* <div className="text-xs text-gray-500 mt-1">
                        Device: {item.deviceInfo?.split(",")[0] || "N/A"}
                      </div> */}
                    </td>

                    <td className="px-2 py-3">
                      <div>
                        <span className="text font-medium text-gray-800">
                          📍{" "}
                          {item.startAddress?.split(",").slice(0, 4).join(",")}
                        </span>
                        <div className="text-xs text-gray-500">
                          {new Date(item.startDate).toLocaleString("en-GB")}
                        </div>
                      </div>
                    </td>

                    <td className="px-2 py-3">
                      {item.endDate ? (
                        <div>
                          <span className="font-medium text-gray-800">
                            🚩{" "}
                            {item.endAddress?.split(",").slice(0, 4).join(",")}
                          </span>
                          <div className="text-gray-500">
                            {new Date(item.endDate).toLocaleString("en-GB")}
                          </div>
                        </div>
                      ) : (
                        <span className="text-yellow-700 text-sm italic">
                          In Progress...
                        </span>
                      )}
                    </td>

                    <td className="px-2 py-3 text-center">
                      {item.endDate ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          ✅Completed
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                          🕒 Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpTravel;
