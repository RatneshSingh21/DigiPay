import { NavLink } from "react-router-dom";

const EmployeeSidebarItem = ({ icon, label, to, collapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative group flex items-center gap-3 text-sm p-2 rounded-md mb-1 cursor-pointer transition-all duration-300 text-white ${
          isActive ? "bg-primary" : "hover:bg-primary"
        }`
      }
    >
      <span className="text-md">{icon}</span>
      {!collapsed && <span className="text-xs">{label}</span>}

      {collapsed && (
        <div className="absolute left-full top-1/2 z-50 -translate-y-1/2 ml-3 hidden group-hover:block">
          <div className="bg-gray-900 text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap">
            {label}
          </div>
        </div>
      )}
    </NavLink>
  );
};

export default EmployeeSidebarItem;