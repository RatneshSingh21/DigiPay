import { Link, useLocation } from "react-router-dom";

const AdminSidebarItem = ({ icon, label, collapsed, to, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative group flex items-center gap-3 text-sm p-2 rounded-md mb-1 cursor-pointer transition-colors ${
        isActive ? "bg-primary" : "hover:bg-primary"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span className="text-xs">{label}</span>}

      {collapsed && (
        <div className="absolute left-full top-1/2 z-50 -translate-y-1/2 ml-3 hidden group-hover:block">
          <div className="bg-gray-900 text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap">
            {label}
          </div>
        </div>
      )}
    </Link>
  );
};

export default AdminSidebarItem;
