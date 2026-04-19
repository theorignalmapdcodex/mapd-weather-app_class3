"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { useWeather } from "@/contexts/WeatherContext";
import { CCHeader } from "@/components/CCHeader";
import { WeatherIcon } from "@/components/WeatherIcon";
import { weatherCodeToCondition } from "@/lib/copy";
import Link from "next/link";
import { HourlyForecast } from "@/types/weather";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

function toC(f: number) { return Math.round((f - 32) * 5 / 9); }
function displayTemp(f: number, unit: string) { return unit === 'C' ? toC(f) : f; }

interface Task { id: string; label: string; hour: number; time: string; }

const WINDOWS = [
  { label: 'Morning run', start: 6, end: 9, time: '6–9 AM' },
  { label: 'Mid-morning', start: 9, end: 12, time: '9 AM–12 PM' },
  { label: 'Afternoon', start: 12, end: 15, time: '12–3 PM' },
  { label: 'Late afternoon', start: 15, end: 18, time: '3–6 PM' },
  { label: 'Evening', start: 18, end: 21, time: '6–9 PM' },
];

function getWindowStatus(start: number, end: number, hourly: HourlyForecast[]) {
  const hrs = hourly.filter(h => {
    const hr = new Date(h.time + ':00').getHours();
    return hr >= start && hr < end;
  });
  if (!hrs.length) return 'good';
  const avgPrecip = hrs.reduce((a, b) => a + b.precipProbability, 0) / hrs.length;
  const hasStorm = hrs.some(h => h.weatherCode >= 95);
  if (hasStorm || avgPrecip > 60) return 'inside';
  if (avgPrecip > 30) return 'heads-up';
  return 'good';
}

function getTaskStatus(hour: number, hourly: HourlyForecast[]) {
  const h = hourly.find(h => new Date(h.time + ':00').getHours() === hour);
  if (!h) return 'good';
  if (h.precipProbability > 60 || h.weatherCode >= 95) return 'reschedule';
  if (h.precipProbability > 30) return 'heads-up';
  return 'good';
}

const STATUS_COLORS = {
  good: { bg: '#4CAF50', text: '#fff' },
  'heads-up': { bg: '#FF9800', text: '#fff' },
  inside: { bg: '#F44336', text: '#fff' },
  reschedule: { bg: '#F44336', text: '#fff' },
};

export default function PlanPage() {
  const { theme, accent } = useTheme();
  const { unit } = useTemperature();
  const { weather, loading } = useWeather();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newHour, setNewHour] = useState(9);

  useEffect(() => {
    const saved = localStorage.getItem('cc-tasks');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const saveTasks = (t: Task[]) => {
    setTasks(t);
    localStorage.setItem('cc-tasks', JSON.stringify(t));
  };

  const addTask = () => {
    if (!newLabel.trim()) return;
    const ampm = newHour < 12 ? 'AM' : 'PM';
    const h12 = newHour === 0 ? 12 : newHour > 12 ? newHour - 12 : newHour;
    const t: Task = { id: Date.now().toString(), label: newLabel.trim(), hour: newHour, time: `${h12}:00 ${ampm}` };
    saveTasks([...tasks, t]);
    setNewLabel('');
    setNewHour(9);
    setShowAdd(false);
  };

  const removeTask = (id: string) => saveTasks(tasks.filter(t => t.id !== id));

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '56px 16px 120px', color: theme.ink, fontFamily: BODY,
  };

  if (loading) return (
    <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CCHeader />
    </div>
  );

  if (!weather) return (
    <div style={pageStyle}>
      <CCHeader />
      <div style={{ paddingTop: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 800, marginBottom: 12 }}>No city set.</div>
        <Link href="/" style={{ color: accent, fontFamily: MONO, fontSize: 13 }}>← Go to Now tab</Link>
      </div>
    </div>
  );

  const now = new Date();
  const getHourly = () => {
    if (!weather.hourly?.length) return [];
    try {
      const localStr = now.toLocaleString('en-CA', {
        timeZone: weather.timezone, hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
      });
      const currentHour = localStr.replace(', ', 'T').slice(0, 13);
      let idx = weather.hourly.findIndex(h => h.time.slice(0, 13) === currentHour);
      if (idx < 0) idx = 0;
      return weather.hourly.slice(idx, idx + 24);
    } catch { return weather.hourly.slice(0, 24); }
  };

  const hourly = getHourly();
  const todayForecast = weather.forecast[0];
  const isNight = now.getHours() < 6 || now.getHours() >= 20;

  return (
    <div style={pageStyle}>
      <CCHeader />

      {/* Page label */}
      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
        Today · Weather-Aware
      </div>

      {/* Big headline */}
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(38px, 12vw, 56px)', letterSpacing: -2, lineHeight: 0.92, marginBottom: 12 }}>
        Plan your<br />day.
      </div>
      <div style={{ color: theme.mute, fontSize: 15, lineHeight: 1.45, marginBottom: 28, maxWidth: 320 }}>
        We cross-check your tasks against the sky.
      </div>

      {/* Today summary strip */}
      <div style={{ background: theme.card, borderRadius: 18, padding: '14px 16px', marginBottom: 20, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <WeatherIcon code={todayForecast.condition.code} size={36} color={theme.ink} accent={accent} night={isNight} />
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Today</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 }}>
            {displayTemp(todayForecast.maxTemp, unit)}° / {displayTemp(todayForecast.minTemp, unit)}°
            <span style={{ color: todayForecast.precipProbability > 30 ? accent : theme.mute, fontSize: 13, fontFamily: MONO, marginLeft: 8 }}>
              {todayForecast.precipProbability}% rain
            </span>
          </div>
        </div>
      </div>

      {/* Good windows section */}
      <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
        Good Windows Today
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 }}>
        {WINDOWS.map(w => {
          const status = getWindowStatus(w.start, w.end, hourly);
          const col = STATUS_COLORS[status];
          const wHourly = hourly.find(h => new Date(h.time + ':00').getHours() === w.start);
          const code = wHourly?.weatherCode ?? 0;
          return (
            <div key={w.time} style={{
              background: status === 'good' ? `${col.bg}18` : status === 'heads-up' ? `${col.bg}18` : `${col.bg}18`,
              borderRadius: 14, padding: '12px 14px',
              border: `1.5px solid ${col.bg}40`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <WeatherIcon code={code} size={18} color={col.bg} accent={col.bg} />
                <div style={{
                  fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                  textTransform: 'uppercase', color: col.bg,
                  background: `${col.bg}20`, borderRadius: 99, padding: '2px 6px',
                }}>
                  {status === 'good' ? 'GOOD' : status === 'heads-up' ? 'HEADS UP' : 'STAY IN'}
                </div>
              </div>
              <div style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 1 }}>{w.label}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute }}>{w.time}</div>
            </div>
          );
        })}
      </div>

      {/* Tasks section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          {tasks.length} Task{tasks.length !== 1 ? 's' : ''}
        </div>
        <button onClick={() => setShowAdd(s => !s)} style={{
          width: 32, height: 32, borderRadius: 999, background: accent,
          border: 'none', cursor: 'pointer', color: theme.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: DISPLAY, fontSize: 20, lineHeight: 1,
        }}>+</button>
      </div>

      {/* Add task form */}
      {showAdd && (
        <div style={{ background: theme.card, borderRadius: 18, padding: 16, marginBottom: 14, border: `1px solid ${theme.border}` }}>
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Task name…"
            onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 999,
              border: `1px solid ${theme.border}`, background: theme.bg,
              color: theme.ink, fontSize: 15, fontFamily: BODY,
              outline: 'none', boxSizing: 'border-box', marginBottom: 10,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, whiteSpace: 'nowrap' }}>Time:</div>
            <input
              type="range" min="0" max="23" value={newHour}
              onChange={e => setNewHour(Number(e.target.value))}
              style={{ flex: 1, accentColor: accent }}
            />
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: theme.ink, width: 48, textAlign: 'right' }}>
              {newHour === 0 ? '12 AM' : newHour < 12 ? `${newHour} AM` : newHour === 12 ? '12 PM' : `${newHour - 12} PM`}
            </div>
          </div>
          <button onClick={addTask} style={{
            width: '100%', padding: 12, borderRadius: 999,
            background: theme.ink, color: theme.bg, border: 'none',
            cursor: 'pointer', fontFamily: DISPLAY, fontWeight: 700, fontSize: 14,
          }}>Add task →</button>
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: theme.mute, fontFamily: BODY, fontSize: 14 }}>
          No tasks yet. Tap + to add one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.sort((a, b) => a.hour - b.hour).map(task => {
            const status = getTaskStatus(task.hour, hourly);
            const col = STATUS_COLORS[status === 'reschedule' ? 'reschedule' : status];
            const taskHourly = hourly.find(h => new Date(h.time + ':00').getHours() === task.hour);
            const code = taskHourly?.weatherCode ?? 0;

            return (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: theme.card, borderRadius: 16, padding: '14px 16px',
                border: `1px solid ${theme.border}`,
              }}>
                <button onClick={() => removeTask(task.id)} style={{
                  width: 22, height: 22, borderRadius: 999,
                  border: `1.5px solid ${theme.muter}`, background: 'transparent',
                  cursor: 'pointer', flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: BODY, fontSize: 15, fontWeight: 600, color: theme.ink }}>{task.label}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, marginTop: 2 }}>
                    {task.time}
                    {taskHourly && <span> · {taskHourly.precipProbability}% rain</span>}
                  </div>
                </div>
                <WeatherIcon code={code} size={20} color={theme.ink} accent={accent} />
                <div style={{
                  fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                  textTransform: 'uppercase', color: col.bg,
                  background: `${col.bg}20`, borderRadius: 99, padding: '3px 8px',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {status === 'good' ? 'GOOD' : status === 'heads-up' ? 'HEADS UP' : 'RESCHEDULE?'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
