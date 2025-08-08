import useAuthStore from "../store/authStore";

const Profile = () => {
 const user = useAuthStore((state) => state.user);

  const name = user?.name || user.fullName || "User";
  const imageUrl = user?.imageUrl || "";
  const emailOrPhone = user?.emailOrPhone || "";

  const getInitial = (fullName) => fullName?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden w-full max-w-sm mx-auto">
      {/* Background Header */}
      <div className="h-32 bg-secondary"></div>

      {/* Profile Image */}
      <div className="flex justify-center -mt-16">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-white object-cover"
          />
        ) : (
          <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-300 text-gray-700 flex items-center justify-center text-3xl font-bold">
            {getInitial(name)}
          </div>
        )}
      </div>

      {/* User Name */}
      <div className="text-center mt-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
        <p className="text-sm text-gray-500">{user?.role || "User"}</p>
        <p className="text-sm text-gray-500">{emailOrPhone}</p>
      </div>
    </div>
  );
};

export default Profile;
