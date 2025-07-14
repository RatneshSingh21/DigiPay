const AdminSubmenu = ({ items }) => {
  return (
    <ul className="ml-6 text-sm text-gray-300">
      {items.map((item, idx) => (
        <li
          key={idx}
          className="py-1 px-2 rounded hover:bg-secondary cursor-pointer transition-colors"
        >
          {item}
        </li>
      ))}
    </ul>
  );
};

export default AdminSubmenu;
