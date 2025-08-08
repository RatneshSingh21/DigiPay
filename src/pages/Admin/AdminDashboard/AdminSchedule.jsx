import { FaCalendarAlt, FaClock, FaUserCircle } from "react-icons/fa";

const scheduleItems = [
  {
    time: "10:00",
    title: "Meeting with John",
    duration: "10:00 - 11:00",
    avatars: [<FaUserCircle key="1" size={18} />, <FaUserCircle key="2" size={18} />],
  },
  {
    time: "12:00",
    title: "Internal Meeting",
    duration: "12:00 - 13:00",
    avatars: [<FaUserCircle key="3" size={18} />],
  },
  {
    time: "17:00",
    title: "Preparing for next day",
    duration: "17:00 - 18:00",
    avatars: [<FaUserCircle key="4" size={18} />],
  },
];

const AdminSchedule = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaCalendarAlt className="text-primary" />
          To Do List
        </h3>
        <button className="text-sm text-gray-400">See all</button>
      </div>

      <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
        <FaCalendarAlt className="text-gray-400" />
        Wed, Aug 16, 2025
      </div>

      <div className="space-y-5">
        {scheduleItems.map((item, i) => (
          <div key={i} className="border-l-4 border-primary pl-3 relative">
            <div className="flex items-center text-xs text-gray-400 mb-1 gap-1">
              <FaClock className="text-gray-400" />
              {item.time}
            </div>
            <div className="font-medium text-sm">{item.title}</div>
            <div className="text-xs text-gray-500 mb-1">{item.duration}</div>
            <div className="flex space-x-2 mt-1 text-gray-500">
              {item.avatars.map((icon, idx) => (
                <span key={idx} className="inline-block">{icon}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSchedule;
