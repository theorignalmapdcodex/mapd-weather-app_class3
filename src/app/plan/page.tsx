"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { useWeather } from "@/contexts/WeatherContext";
import { useTasks, formatTime } from "@/contexts/TaskContext";
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

// 15-minute increment time options (96 slots across 24h)
const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const totalMins = i * 15;
  const hour = Math.floor(totalMins / 60);
  const minute = totalMins % 60;
  return { value: i, label: formatTime(hour, minute), hour, minute };
});

const WINDOWS = [
  { label: 'Morning', start: 6, end: 9, time: '6–9 AM' },
  { label: 'Mid-morning', start: 9, end: 12, time: '9 AM–12 PM' },
  { label: 'Afternoon', start: 12, end: 15, time: '12–3 PM' },
  { label: 'Late PM', start: 15, end: 18, time: '3–6 PM' },
  { label: 'Evening', start: 18, end: 21, time: '6–9 PM' },
  { label: 'Night', start: 21, end: 24, time: '9–11 PM' },
];

function getWindowStatus(start: number, end: number, hourly: HourlyForecast[]) {
  const hrs = hourly.filter(h => {
    const hr = new Date(h.time + ':00').getHours();
    return hr >= start && hr < end;
  });
  if (!hrs.length) return 'good';
  const avg = hrs.reduce((a, b) => a + b.precipProbability, 0) / hrs.length;
  if (hrs.some(h => h.weatherCode >= 95) || avg > 60) return 'inside';
  if (avg > 30) return 'heads-up';
  return 'good';
}

function getHourStatus(hour: number, minute: number, hourly: HourlyForecast[]) {
  const h = hourly.find(h => new Date(h.time + ':00').getHours() === hour);
  if (!h) return 'good';
  if (h.precipProbability > 60 || h.weatherCode >= 95) return 'reschedule';
  if (h.precipProbability > 30) return 'heads-up';
  return 'good';
}

const STATUS = {
  good:      { bg: '#4CAF50', label: 'GOOD' },
  'heads-up':{ bg: '#FF9800', label: 'HEADS UP' },
  inside:    { bg: '#EF5350', label: 'STAY IN' },
  reschedule:{ bg: '#EF5350', label: 'RESCHEDULE?' },
  overdue:   { bg: '#EF5350', label: 'OVERDUE' },
};

export default function PlanPage() {
  const { theme, accent } = useTheme();
  const { unit } = useTemperature();
  const { weather, loading } = useWeather();
  const { todayTasks, overdueTasks, toggleComplete, removeTask, clearCompleted, addTask } = useTasks();
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [timeIdx, setTimeIdx] = useState(36); // default 9:00 AM (index 36)

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
        <Link href="/" style={{ color: accent, fontFamily: MONO, fontSize: 13 }}>← Go home</Link>
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
  const completedCount = todayTasks.filter(t => t.completed).length;
  const selectedTime = TIME_OPTIONS[timeIdx];

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addTask(newLabel.trim(), selectedTime.hour, selectedTime.minute);
    setNewLabel('');
    setTimeIdx(36);
    setShowAdd(false);
  };

  type TaggedTask = typeof todayTasks[0] & { _overdue: boolean };
  const allTasks: TaggedTask[] = [
    ...overdueTasks.map(t => ({ ...t, _overdue: true as const })),
    ...todayTasks
      .sort((a, b) => a.hour !== b.hour ? a.hour - b.hour : a.minute - b.minute)
      .map(t => ({ ...t, _overdue: false as const })),
  ];

  return (
    <div style={pageStyle}>
      <CCHeader />

      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
        Today · Weather-Aware
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(38px, 12vw, 56px)', letterSpacing: -2, lineHeight: 0.92, marginBottom: 12 }}>
        Plan your<br />day.
      </div>
      <div style={{ color: theme.mute, fontSize: 15, lineHeight: 1.45, marginBottom: 24, maxWidth: 320 }}>
        We cross-check your tasks against the sky.
      </div>

      {/* Today summary */}
      <div style={{ background: theme.card, borderRadius: 18, padding: '14px 16px', marginBottom: 24, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <WeatherIcon code={todayForecast.condition.code} size={36} color={theme.ink} accent={accent} night={isNight} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Today</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 }}>
            {displayTemp(todayForecast.maxTemp, unit)}° / {displayTemp(todayForecast.minTemp, unit)}°
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: todayForecast.precipProbability > 30 ? accent : theme.muter }}>
          {todayForecast.precipProbability}% rain
        </div>
      </div>

      {/* Good windows */}
      <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
        Good Windows Today
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 28 }}>
        {WINDOWS.map(w => {
          const status = getWindowStatus(w.start, w.end, hourly);
          const s = STATUS[status] || STATUS.good;
          const wHour = hourly.find(h => new Date(h.time + ':00').getHours() === w.start);
          return (
            <div key={w.time} style={{
              background: `${s.bg}12`, borderRadius: 14, padding: '10px 12px',
              border: `1.5px solid ${s.bg}35`,
            }}>
              <div style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, color: theme.ink, marginBottom: 3 }}>{w.label}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: theme.mute, marginBottom: 6 }}>{w.time}</div>
              <div style={{
                display: 'inline-block', fontFamily: MONO, fontSize: 8, fontWeight: 700,
                letterSpacing: 0.3, textTransform: 'uppercase', color: s.bg,
                background: `${s.bg}22`, borderRadius: 99, padding: '2px 6px',
              }}>
                {s.label}
              </div>
              {wHour && (
                <div style={{ marginTop: 6 }}>
                  <WeatherIcon code={wHour.weatherCode} size={14} color={s.bg} accent={s.bg} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tasks header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          {allTasks.length} Task{allTasks.length !== 1 ? 's' : ''}
          {completedCount > 0 && <span style={{ color: theme.muter }}> · {completedCount} done</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {completedCount > 0 && (
            <button type="button" onClick={clearCompleted} style={{
              fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
              color: theme.mute, background: 'transparent',
              border: `1px solid ${theme.border}`, borderRadius: 99,
              padding: '4px 10px', cursor: 'pointer', textTransform: 'uppercase',
            }}>Clear done</button>
          )}
          <button type="button" onClick={() => setShowAdd(s => !s)} style={{
            width: 32, height: 32, borderRadius: 999, background: accent,
            border: 'none', cursor: 'pointer', color: theme.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontFamily: DISPLAY, fontWeight: 700, lineHeight: 1,
          }}>+</button>
        </div>
      </div>

      {/* Add task form */}
      {showAdd && (
        <div style={{ background: theme.card, borderRadius: 18, padding: 16, marginBottom: 14, border: `1px solid ${theme.border}` }}>
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Task name…"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 999,
              border: `1px solid ${theme.border}`, background: theme.bg,
              color: theme.ink, fontSize: 15, fontFamily: BODY,
              outline: 'none', boxSizing: 'border-box', marginBottom: 12,
            }}
          />
          {/* 15-min time picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 0.5 }}>Time</div>
            <select
              aria-label="Task time"
              value={timeIdx}
              onChange={e => setTimeIdx(Number(e.target.value))}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 999,
                border: `1px solid ${theme.border}`, background: theme.bg,
                color: theme.ink, fontSize: 14, fontFamily: MONO,
                outline: 'none', cursor: 'pointer',
              }}
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button type="button" onClick={handleAdd} style={{
            width: '100%', padding: 12, borderRadius: 999,
            background: theme.ink, color: theme.bg, border: 'none',
            cursor: 'pointer', fontFamily: DISPLAY, fontWeight: 700, fontSize: 14,
          }}>Add task →</button>
        </div>
      )}

      {/* Task list */}
      {allTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: theme.mute, fontFamily: BODY, fontSize: 14 }}>
          No tasks yet. Tap + to add one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allTasks.map(task => {
            const isOverdue = '_overdue' in task && task._overdue;
            const weatherStatus = isOverdue ? 'overdue' : getHourStatus(task.hour, task.minute, hourly);
            const s = STATUS[weatherStatus] || STATUS.good;
            const taskHourly = hourly.find(h => new Date(h.time + ':00').getHours() === task.hour);
            const code = taskHourly?.weatherCode ?? 0;

            return (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: task.completed ? `${theme.card}80` : theme.card,
                borderRadius: 16, padding: '14px 16px',
                border: isOverdue
                  ? `1.5px solid ${s.bg}40`
                  : `1px solid ${theme.border}`,
                opacity: task.completed ? 0.65 : 1,
                transition: 'opacity 0.2s',
              }}>
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleComplete(task.id)}
                  style={{
                    width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                    border: `2px solid ${task.completed ? accent : theme.muter}`,
                    background: task.completed ? accent : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {task.completed && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke={theme.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Label + time */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: BODY, fontSize: 15, fontWeight: 600, color: theme.ink,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    textDecorationColor: theme.muter,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{task.label}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, marginTop: 2 }}>
                    {formatTime(task.hour, task.minute)}
                    {isOverdue && <span style={{ color: s.bg, marginLeft: 6 }}>· yesterday</span>}
                    {task.completed && task.completedAt && (
                      <span style={{ color: theme.muter, marginLeft: 6 }}>· done</span>
                    )}
                  </div>
                </div>

                {/* Weather icon */}
                {!task.completed && <WeatherIcon code={code} size={20} color={theme.ink} accent={accent} />}

                {/* Status badge */}
                {!task.completed && (
                  <div style={{
                    fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                    textTransform: 'uppercase', color: s.bg,
                    background: `${s.bg}18`, borderRadius: 99, padding: '3px 8px',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {s.label}
                  </div>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  style={{
                    width: 20, height: 20, borderRadius: 99, background: 'transparent',
                    border: 'none', cursor: 'pointer', color: theme.muter,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 14, lineHeight: 1,
                  }}
                >×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
