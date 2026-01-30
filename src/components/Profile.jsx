import { useState } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";
import axiosInstance from "../axiosInstance/axiosInstance";

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(user?.profileImageUrl || "");
  const [loading, setLoading] = useState(false);

  const name = user?.name || user?.fullName || "User";
  const emailOrPhone = user?.emailOrPhone || "";

  const getInitial = (fullName) => fullName?.charAt(0)?.toUpperCase() || "?";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async () => {
    if (!selectedImage) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", selectedImage);

      let res;

      if (user.role === "Employee") {
        // EMPLOYEE API
        res = await axiosInstance.post(
          `/Employee/${user.userId}/profile-image`,
          formData
        );
      } else {
        // ADMIN API
        const adminForm = new FormData();
        adminForm.append("UserId", user.userId);
        adminForm.append("Name", name);
        adminForm.append("Image", selectedImage);

        res = await axiosInstance.post("/user-auth/update-profile", adminForm);
      }

      updateUser({
        profileImageUrl: res.data?.profileImageUrl || preview,
      });

      toast.success("Profile image updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="h-32 bg-secondary"></div>

      {/* Profile Image */}
      <div className="flex justify-center -mt-16 relative">
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-white object-contain bg-secondary"
          />
        ) : (
          <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-300 text-gray-700 flex items-center justify-center text-3xl font-bold">
            {getInitial(name)}
          </div>
        )}

        {/* Upload Button */}
        <label className="absolute bottom-1 right-[42%] bg-primary text-white px-2 py-1 rounded-full cursor-pointer text-xs">
          Edit
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </label>
      </div>

      {/* User Info */}
      <div className="text-center mt-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
        <p className="text-sm text-gray-500">{user?.role || "User"}</p>
        <p className="text-sm text-gray-500">{emailOrPhone}</p>

        {selectedImage && (
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-primary cursor-pointer text-white rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? "Updating..." : "Save Image"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
