import {
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { format } from "date-fns";
import { useState } from "react";

const priorityColors = {
  High: "border-red-500",
  Medium: "border-yellow-500",
  Low: "border-green-500",
};

const statusColors = {
  Pending: "text-yellow-500",
  "In Progress": "text-blue-500",
  Completed: "text-green-600",
};

const AdminSchedule = () => {
  const today = format(new Date(), "EEE, MMM dd, yyyy");

  // State for tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      time: "10:00 AM",
      title: "Meeting with John",
      duration: "10:00 - 11:00 AM",
      avatars: ["J", "S"],
      status: "Pending",
      priority: "High",
    },
    {
      id: 2,
      time: "12:00 PM",
      title: "Internal Meeting",
      duration: "12:00 - 13:00 PM",
      avatars: ["A", "Q"],
      status: "In Progress",
      priority: "Medium",
    },
    {
      id: 3,
      time: "05:00 PM",
      title: "Preparing for next day",
      duration: "05:00 - 06:00 PM",
      avatars: ["M"],
      status: "Completed",
      priority: "Low",
    },
  ]);

  // Mark task as completed
  const markComplete = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: "Completed" } : task
      )
    );
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Edit task (for demo just change title)
  const editTask = (id) => {
    const newTitle = prompt("Edit Task Title:");
    if (newTitle) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, title: newTitle } : task
        )
      );
    }
  };

  // Add new task (demo only)
  const addTask = () => {
    const title = prompt("Enter Task Title:");
    if (title) {
      setTasks((prev) => [
        ...prev,
        {
          id: Date.now(),
          time: "14:00 AM",
          title,
          duration: "14:00 - 15:00",
          avatars: ["N"],
          status: "Pending",
          priority: "Medium",
        },
      ]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaCalendarAlt className="text-primary" />
          To Do List
        </h3>
        <button
          onClick={addTask}
          className="text-sm text-white cursor-pointer hover:bg-secondary p-1 rounded  bg-primary transition"
        >
          + Add Task
        </button>
      </div>

      {/* Current Date */}
      <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
        <FaCalendarAlt className="text-gray-400" />
        {today}
      </div>

      {/* Schedule Items */}
      <div className="space-y-5">
        {tasks.map((item) => (
          <div
            key={item.id}
            className={`relative border-l-4 pl-3 pt-2 rounded-md transition hover:bg-gray-50 ${
              priorityColors[item.priority]
            }`}
          >
            {/* Time */}
            <div className="flex items-center text-xs text-gray-400 mb-1 gap-1">
              <FaClock className="text-gray-400" />
              {item.time}
            </div>

            {/* Title & Status */}
            <div className="flex justify-between items-center">
              <div className="font-medium text-sm">{item.title}</div>
              <p
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  statusColors[item.status]
                } bg-gray-100`}
              >
                {item.status}
              </p>
            </div>

            {/* Duration */}
            <div className="text-xs text-gray-500 mb-1">{item.duration}</div>

            {/* Avatars */}
            <div className="flex space-x-2 mt-1">
              {item.avatars.map((avatar, idx) => (
                <div
                  key={idx}
                  className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm hover:scale-110 transition"
                >
                  {avatar}
                </div>
              ))}
            </div>

            {/* Actions with Tooltip */}
            <div className="flex gap-3 absolute right-2 top-2 text-gray-400 text-sm">
              <div className="relative group">
                <button
                  onClick={() => markComplete(item.id)}
                  className="hover:text-green-600 transition cursor-pointer"
                >
                  <FaCheckCircle />
                </button>
                <span className="absolute -top-11 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md">
                  Mark Complete
                </span>
              </div>

              <div className="relative group">
                <button
                  onClick={() => editTask(item.id)}
                  className="hover:text-blue-600 transition cursor-pointer"
                >
                  <FaEdit />
                </button>
                <span className="absolute -top-11 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md">
                  Edit Task
                </span>
              </div>

              <div className="relative group">
                <button
                  onClick={() => deleteTask(item.id)}
                  className="hover:text-red-600 transition cursor-pointer"
                >
                  <FaTrash />
                </button>
                <span className="absolute -top-11 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md">
                  Delete Task
                </span>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="text-center text-gray-400 text-sm">
            No tasks available. Add one!
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminSchedule;
