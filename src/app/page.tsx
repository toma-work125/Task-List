"use client"
import { useState, useEffect, useRef } from "react";
import { FaCheck, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Task type definition
type Task = {
  id: number;
  title: string;
  time: string; // "HH:MM" format
  done: boolean;
  notified?: boolean; // to prevent multiple notifications
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [alarmTask, setAlarmTask] = useState<Task | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio alarm only in browser
  useEffect(() => {
    alarmRef.current = new Audio(
      "https://cdn.pixabay.com/download/audio/2025/07/18/audio_7a9ff3366a.mp3?filename=ringtone-023-376906.mp3"
    );
    alarmRef.current.loop = true; // repeat until dismissed
  }, []);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Check for alarm every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      tasks.forEach((task) => {
        // If task is not done and time matches and notification not sent
        if (!task.done && task.time === currentTime && !task.notified) {
          setAlarmTask(task); // show modal
          alarmRef.current?.play(); // play alarm
          // mark as notified to prevent repeated alarms
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id ? { ...t, notified: true } : t
            )
          );
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  // Add new task
  const addTask = () => {
    if (!title || !time) return;
    const newTask: Task = { id: Date.now(), title, time, done: false, notified: false };
    setTasks([...tasks, newTask]);
    setTitle("");
    setTime("");
  };

  // Toggle task completion
  // Once a task is marked done, it cannot be undone
  const toggleDone = (id: number) => {
    setTasks(tasks.map((t) => {
      if (t.id === id && !t.done) {
        return { ...t, done: true };
      }
      return t;
    }));
  };

  // Delete a task
  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Dismiss alarm modal and stop sound
  const dismissAlarm = () => {
    alarmRef.current?.pause();
    if (alarmRef.current) alarmRef.current.currentTime = 0;
    setAlarmTask(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8 flex flex-col items-center text-white font-sans">
      {/* Header */}
      <h1 className="text-5xl font-extrabold mb-8 text-purple-400">Daily Planner</h1>

      {/* Task Input */}
      <div className="flex gap-3 mb-8 w-full max-w-xl">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 p-3 rounded-2xl border-2 border-purple-700 focus:outline-none text-white"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="p-3 rounded-2xl  focus:outline-none border-2 border-purple-700 text-white"
        />
        <button
          onClick={addTask}
          className="px-5 py-3 bg-purple-600 rounded-2xl hover:bg-purple-700 transition"
        >
          Add
        </button>
      </div>

      {/* Task List */}
      <ul className="w-full max-w-xl space-y-4">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              layout
              className={`flex justify-between items-center p-5 rounded-3xl shadow-2xl bg-gradient-to-r ${
                task.done
                  ? "from-green-500 to-green-400"
                  : "from-purple-700 to-pink-600"
              }`}
            >
              <div>
                <h2
                  className={`text-xl font-bold ${
                    task.done ? "line-through text-gray-200" : "text-white"
                  }`}
                >
                  {task.title}
                </h2>
                <p className="text-sm text-gray-200">{task.time}</p>
              </div>
              <div className="flex gap-3">
                {/* Done button: can be clicked only once */}
                <button
                  onClick={() => toggleDone(task.id)}
                  className="p-3 bg-white rounded-full text-green-600 hover:bg-green-100 transition"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-3 bg-white rounded-full text-red-600 hover:bg-red-100 transition"
                >
                  <FaTrash />
                </button>
                
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Alarm Modal */}
      <AnimatePresence>
        {alarmTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white text-black rounded-3xl p-8 w-96 flex flex-col items-center gap-4 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-red-600">⏰ Time Up!</h2>
              <p className="text-xl font-semibold">{alarmTask.title}</p>
              <p className="text-gray-600">{alarmTask.time}</p>
              <button
                onClick={dismissAlarm}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
              >
                Dismiss
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
