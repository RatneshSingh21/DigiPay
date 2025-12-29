import axiosInstance from "../../../../axiosInstance/axiosInstance";

/* ===============================
   REGISTER BIOMETRIC DEVICE
================================ */
export const registerDevice = (payload) => {
  return axiosInstance.post(
    "/BiometricAttendance/register-device",
    payload
  );
};

/* ===============================
   GET DEVICES
================================ */
export const getBiometricDevices = (isActive = true) => {
  return axiosInstance.get(
    `/BiometricAttendance/devices?isActive=${isActive}`
  );
};

/* ===============================
   UPDATE DEVICE (PUT)
================================ */
export const updateDevice = (deviceId, payload) => {
  return axiosInstance.put(
    `/BiometricAttendance/device/${deviceId}`,
    payload
  );
};

/* ===============================
   DELETE DEVICE
================================ */
export const deleteDevice = (deviceId) => {
  return axiosInstance.delete(
    `/BiometricAttendance/device/${deviceId}`
  );
};

/* ===============================
   BULK MAP EMPLOYEES TO DEVICE
================================ */
export const bulkMapEmployees = (payload) => {
  return axiosInstance.post(
    "/BiometricAttendance/bulk-map-import",
    payload
  );
};

/* ===============================
   DEVICE PUSH ATTENDANCE
================================ */
export const pushAttendance = (payload) => {
  return axiosInstance.post(
    "/BiometricAttendance/device-push",
    payload
  );
};

export const mapEmployeeToDevice = (payload) =>
  axiosInstance.post("/BiometricAttendance/map-employee", payload);

export const getDeviceMappings = (deviceId) =>
  axiosInstance.get(`/BiometricAttendance/device-mappings/${deviceId}`);