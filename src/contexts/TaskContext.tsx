"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface Task {
  id: string;
  label: string;
  date: string;       // YYYY-MM-DD
  hour: number;       // 0-23
  minute: number;     // 0, 15, 30, 45
  completed: boolean;
  completedAt?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (label: string, hour: number, minute: number) => void;
  toggleComplete: (id: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
  todayTasks: Task[];
  overdueTasks: Task[];
  incompleteCount: number;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(hour: number, minute: number) {
  const ampm = hour < 12 ? 'AM' : 'PM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cc-tasks-v2');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const save = (t: Task[]) => {
    setTasks(t);
    localStorage.setItem('cc-tasks-v2', JSON.stringify(t));
  };

  const addTask = useCallback((label: string, hour: number, minute: number) => {
    const t: Task = {
      id: Date.now().toString(),
      label,
      date: todayStr(),
      hour, minute,
      time: formatTime(hour, minute),
      completed: false,
    } as Task & { time: string };
    save([...tasks, t]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  const toggleComplete = useCallback((id: string) => {
    save(tasks.map(t => t.id === id
      ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
      : t
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  const removeTask = useCallback((id: string) => {
    save(tasks.filter(t => t.id !== id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  const clearCompleted = useCallback(() => {
    save(tasks.filter(t => !t.completed));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  const today = todayStr();
  const todayTasks = tasks.filter(t => t.date === today);
  const overdueTasks = tasks.filter(t => t.date < today && !t.completed);
  const incompleteCount = todayTasks.filter(t => !t.completed).length + overdueTasks.length;

  return (
    <TaskContext.Provider value={{
      tasks, addTask, toggleComplete, removeTask, clearCompleted,
      todayTasks, overdueTasks, incompleteCount,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be within TaskProvider");
  return ctx;
}

export { formatTime };
