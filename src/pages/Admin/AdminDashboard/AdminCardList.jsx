// components/CardList.jsx
const cards = [
  {
    type: "Primary",
    bank: "Alli Bank",
    name: "Jack Grealish",
    number: "**** 1234",
    status: "Active",
  },
  {
    type: "Secondary",
    bank: "Newyork Bank",
    name: "David Beckham",
    number: "**** 3344",
    status: "Inactive",
  },
  {
    type: "Primary",
    bank: "Brooklyn NY Bank",
    name: "John Stones",
    number: "**** 5566",
    status: "Active",
  },
];

const AdminCardList = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Card List</h3>
        <button className="text-sm text-gray-400">This Week</button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b">
            <th>Card Type</th>
            <th>Bank Name</th>
            <th>Name</th>
            <th>Card Number</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">{card.type}</td>
              <td>{card.bank}</td>
              <td>{card.name}</td>
              <td>{card.number}</td>
              <td>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    card.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {card.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCardList;
