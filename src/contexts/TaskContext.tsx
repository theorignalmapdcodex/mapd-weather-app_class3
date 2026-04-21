"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useWeather } from "@/contexts/WeatherContext";

export interface Task {
  id: string;
  label: string;
  date: string;       // YYYY-MM-DD
  hour: number;       // 0-23
  minute: number;     // 0, 15, 30, 45
  completed: boolean;
  completedAt?: string;
  progress?: number;  // 0-100
}

export type TaskUpdates = Partial<Pick<Task, 'label' | 'hour' | 'minute' | 'date' | 'progress'>>;

interface TaskContextType {
  tasks: Task[];
  addTask: (label: string, hour: number, minute: number, date: string) => void;
  editTask: (id: string, updates: TaskUpdates) => void;
  toggleComplete: (id: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
  todayTasks: Task[];
  overdueTasks: Task[];
  incompleteCount: number;
  timezone: string | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Returns YYYY-MM-DD in the given timezone (falls back to device local time)
export function todayStr(tz?: string): string {
  try {
    return new Date().toLocaleDateString('en-CA', {
      timeZone: tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function formatTime(hour: number, minute: number) {
  const ampm = hour < 12 ? 'AM' : 'PM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { weather } = useWeather();
  const timezone = weather?.timezone;

  useEffect(() => {
    const saved = localStorage.getItem('cc-tasks-v2');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const addTask = useCallback((label: string, hour: number, minute: number, date: string) => {
    const t: Task = {
      id: Date.now().toString(),
      label, date, hour, minute, completed: false,
    };
    setTasks(prev => {
      const next = [...prev, t];
      localStorage.setItem('cc-tasks-v2', JSON.stringify(next));
      return next;
    });
  }, []);

  const editTask = useCallback((id: string, updates: TaskUpdates) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      localStorage.setItem('cc-tasks-v2', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === id
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
        : t
      );
      localStorage.setItem('cc-tasks-v2', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id);
      localStorage.setItem('cc-tasks-v2', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks(prev => {
      const next = prev.filter(t => !t.completed);
      localStorage.setItem('cc-tasks-v2', JSON.stringify(next));
      return next;
    });
  }, []);

  const today = todayStr(timezone);
  const todayTasks = tasks.filter(t => t.date === today);
  const overdueTasks = tasks.filter(t => t.date < today && !t.completed);
  const incompleteCount = todayTasks.filter(t => !t.completed).length + overdueTasks.length;

  return (
    <TaskContext.Provider value={{
      tasks, addTask, editTask, toggleComplete, removeTask, clearCompleted,
      todayTasks, overdueTasks, incompleteCount, timezone,
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

