const DashboardCard = ({ title, children }) => (
  <div className="bg-white p-4 rounded-2xl shadow">
    {title && (
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {title}
      </h3>
    )}
    {children}
  </div>
);

export default DashboardCard;