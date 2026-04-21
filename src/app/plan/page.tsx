"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTemperature } from "@/contexts/TemperatureContext";
import { useWeather } from "@/contexts/WeatherContext";
import { useTasks, formatTime, todayStr, Task, TaskUpdates } from "@/contexts/TaskContext";
import { CCHeader } from "@/components/CCHeader";
import { WeatherIcon } from "@/components/WeatherIcon";
import Link from "next/link";
import { HourlyForecast } from "@/types/weather";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';
const DISPLAY = 'var(--font-syne), "Syne", system-ui';
const BODY = 'var(--font-space-grotesk), "Space Grotesk", system-ui';

function toC(f: number) { return Math.round((f - 32) * 5 / 9); }
function displayTemp(f: number, unit: string) { return unit === 'C' ? toC(f) : f; }

// Parse free-text time like "9:15 am", "9:15pm", "14:30", "9am" → { hour, minute }
function parseTimeInput(val: string): { hour: number; minute: number } | null {
  const cleaned = val.trim().toLowerCase().replace(/\s+/g, '');
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2] ?? '0', 10);
  const meridiem = match[3];
  if (meridiem === 'pm' && hour !== 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function toTimeInputValue(hour: number, minute: number) {
  const ampm = hour < 12 ? 'AM' : 'PM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function localDateStr(tz?: string) { return todayStr(tz); }

function tomorrowStr(tz?: string) {
  try {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('en-CA', { timeZone: tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone });
  } catch {
    return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  }
}

function friendlyDate(dateStr: string, tz?: string) {
  const today = localDateStr(tz);
  const tomorrow = tomorrowStr(tz);
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  return new Date(dateStr + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getHourStatus(hour: number, hourly: HourlyForecast[]) {
  const h = hourly.find(h => new Date(h.time + ':00').getHours() === hour);
  if (!h) return 'good';
  if (h.precipProbability > 60 || h.weatherCode >= 95) return 'reschedule';
  if (h.precipProbability > 30) return 'heads-up';
  return 'good';
}

const STATUS = {
  good:       { bg: '#4CAF50', label: 'GOOD' },
  'heads-up': { bg: '#FF9800', label: 'HEADS UP' },
  inside:     { bg: '#EF5350', label: 'STAY IN' },
  reschedule: { bg: '#EF5350', label: 'RESCHEDULE?' },
  overdue:    { bg: '#EF5350', label: 'OVERDUE' },
};

// ── Shared form component ─────────────────────────────────────
function TaskForm({
  initialLabel = '', initialTime = '09:00', initialDate,
  onSave, onCancel, theme, accent, saveLabel = 'Add task →', timezone,
}: {
  initialLabel?: string; initialTime?: string; initialDate?: string;
  onSave: (label: string, hour: number, minute: number, date: string) => void;
  onCancel: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
  accent: string;
  saveLabel?: string;
  timezone?: string;
}) {
  const [label, setLabel] = useState(initialLabel);
  const [timeVal, setTimeVal] = useState(initialTime);
  const [timeError, setTimeError] = useState(false);
  const [dateVal, setDateVal] = useState(initialDate ?? localDateStr(timezone));

  const handleSave = () => {
    if (!label.trim()) return;
    const parsed = parseTimeInput(timeVal);
    if (!parsed) { setTimeError(true); return; }
    setTimeError(false);
    onSave(label.trim(), parsed.hour, parsed.minute, dateVal);
  };

  return (
    <div style={{ background: theme.card, borderRadius: 18, padding: 16, border: `1px solid ${theme.border}` }}>
      <input
        value={label}
        onChange={e => setLabel(e.target.value)}
        placeholder="Task name…"
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 999,
          border: `1px solid ${theme.border}`, background: theme.bg,
          color: theme.ink, fontSize: 15, fontFamily: BODY,
          outline: 'none', boxSizing: 'border-box', marginBottom: 10,
        }}
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Date picker */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: theme.mute, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Date</div>
          <input
            type="date"
            value={dateVal}
            min={localDateStr(timezone)}
            onChange={e => setDateVal(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 12,
              border: `1px solid ${theme.border}`, background: theme.bg,
              color: theme.ink, fontSize: 13, fontFamily: MONO,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        {/* Time — free-text "9:15 AM" */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: timeError ? '#E53935' : theme.mute, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            {timeError ? 'Invalid — try "9:15 AM"' : 'Time'}
          </div>
          <input
            type="text"
            value={timeVal}
            onChange={e => { setTimeVal(e.target.value); setTimeError(false); }}
            placeholder="9:15 AM"
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 12,
              border: `1px solid ${timeError ? '#E53935' : theme.border}`, background: theme.bg,
              color: theme.ink, fontSize: 13, fontFamily: MONO,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={handleSave} style={{
          flex: 1, padding: '10px 0', borderRadius: 999,
          background: theme.ink, color: theme.bg, border: 'none',
          cursor: 'pointer', fontFamily: DISPLAY, fontWeight: 700, fontSize: 14,
        }}>{saveLabel}</button>
        <button type="button" onClick={onCancel} style={{
          padding: '10px 16px', borderRadius: 999,
          background: 'transparent', color: theme.mute,
          border: `1px solid ${theme.border}`, cursor: 'pointer',
          fontFamily: MONO, fontSize: 12,
        }}>Cancel</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function TasksPage() {
  const { theme, accent } = useTheme();
  const { unit } = useTemperature();
  const { weather, loading } = useWeather();
  const { todayTasks, overdueTasks, toggleComplete, removeTask, clearCompleted, addTask, editTask, timezone } = useTasks();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const pageStyle = {
    background: theme.bg, minHeight: '100dvh',
    padding: '0 16px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)', color: theme.ink, fontFamily: BODY,
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

  type TaggedTask = Task & { _overdue: boolean };
  const allTasks: TaggedTask[] = [
    ...overdueTasks.map(t => ({ ...t, _overdue: true as const })),
    ...todayTasks
      .sort((a, b) => a.hour !== b.hour ? a.hour - b.hour : a.minute - b.minute)
      .map(t => ({ ...t, _overdue: false as const })),
  ];
  const avgProgress = allTasks.length === 0 ? 0 : Math.round(
    allTasks.reduce((sum, t) => sum + (t.completed ? 100 : (t.progress ?? 0)), 0) / allTasks.length
  );

  return (
    <div style={pageStyle}>
      <CCHeader />

      <div style={{ fontFamily: MONO, fontSize: 11, color: theme.mute, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
        Today · Weather-Aware
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(38px, 12vw, 56px)', letterSpacing: -2, lineHeight: 0.92, marginBottom: 12 }}>
        Your tasks.
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
          <button type="button" onClick={() => { setShowAdd(s => !s); setEditingId(null); }} style={{
            width: 32, height: 32, borderRadius: 999, background: accent,
            border: 'none', cursor: 'pointer', color: theme.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontFamily: DISPLAY, fontWeight: 700, lineHeight: 1,
          }}>+</button>
        </div>
      </div>

      {/* Overall progress bar */}
      {allTasks.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: theme.mute, letterSpacing: 1, textTransform: 'uppercase' }}>Overall progress</div>
            <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: accent }}>{avgProgress}%</div>
          </div>
          <div style={{ height: 5, background: theme.card, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${avgProgress}%`, background: accent, borderRadius: 99, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      {/* Add task form */}
      {showAdd && (
        <div style={{ marginBottom: 14 }}>
          <TaskForm
            theme={theme}
            accent={accent}
            timezone={timezone}
            onSave={(label, hour, minute, date) => {
              addTask(label, hour, minute, date);
              setShowAdd(false);
            }}
            onCancel={() => setShowAdd(false)}
            saveLabel="Add task →"
          />
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
            const isOverdue = task._overdue;
            const weatherStatus = isOverdue ? 'overdue' : getHourStatus(task.hour, hourly);
            const s = STATUS[weatherStatus] || STATUS.good;
            const taskHourly = hourly.find(h => new Date(h.time + ':00').getHours() === task.hour);
            const code = taskHourly?.weatherCode ?? 0;
            const isEditing = editingId === task.id;

            if (isEditing) {
              return (
                <div key={task.id}>
                  <TaskForm
                    theme={theme}
                    accent={accent}
                    initialLabel={task.label}
                    initialTime={toTimeInputValue(task.hour, task.minute)}
                    initialDate={task.date}
                    saveLabel="Save changes →"
                    timezone={timezone}
                    onSave={(label, hour, minute, date) => {
                      editTask(task.id, { label, hour, minute, date } as TaskUpdates);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              );
            }

            return (
              <div key={task.id} style={{
                background: task.completed ? `${theme.card}80` : theme.card,
                borderRadius: 16, padding: '12px 14px',
                border: isOverdue ? `1.5px solid ${s.bg}40` : `1px solid ${theme.border}`,
                opacity: task.completed ? 0.65 : 1,
                transition: 'opacity 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Checkbox */}
                <button type="button" onClick={() => toggleComplete(task.id)} style={{
                  width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                  border: `2px solid ${task.completed ? accent : theme.muter}`,
                  background: task.completed ? accent : 'transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}>
                  {task.completed && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke={theme.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Label + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: BODY, fontSize: 14, fontWeight: 600, color: theme.ink,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    textDecorationColor: theme.muter,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{task.label}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: theme.mute, marginTop: 2 }}>
                    {friendlyDate(task.date, timezone)} · {formatTime(task.hour, task.minute)}
                    {isOverdue && <span style={{ color: s.bg, marginLeft: 4 }}>· overdue</span>}
                  </div>
                </div>

                {/* Weather icon */}
                {!task.completed && <WeatherIcon code={code} size={18} color={theme.ink} accent={accent} />}

                {/* Status badge */}
                {!task.completed && (
                  <div style={{
                    fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: 0.3,
                    textTransform: 'uppercase', color: s.bg,
                    background: `${s.bg}18`, borderRadius: 99, padding: '3px 7px',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>{s.label}</div>
                )}

                {/* Edit button */}
                {!task.completed && (
                  <button type="button" onClick={() => { setEditingId(task.id); setShowAdd(false); }}
                    style={{ width: 28, height: 28, borderRadius: 99, background: theme.bgAlt, border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    aria-label="Edit task">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M11 2l3 3L5 14H2v-3L11 2Z" stroke={theme.mute} strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}

                {/* Remove */}
                <button type="button" onClick={() => removeTask(task.id)}
                  style={{ width: 24, height: 24, borderRadius: 99, background: 'transparent', border: 'none', cursor: 'pointer', color: theme.muter, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, lineHeight: 1 }}
                  aria-label="Remove task">×</button>
                </div>

                {/* Progress pills */}
                {!task.completed && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
                    {([0, 25, 50, 75, 100] as const).map(p => {
                      const active = (task.progress ?? 0) === p;
                      return (
                        <button key={p} type="button"
                          onClick={() => {
                            editTask(task.id, { progress: p });
                            if (p === 100 && !task.completed) toggleComplete(task.id);
                            if (p < 100 && task.completed) toggleComplete(task.id);
                          }}
                          style={{
                            padding: '3px 9px', borderRadius: 99, cursor: 'pointer',
                            fontFamily: MONO, fontSize: 9, fontWeight: 700,
                            background: active ? accent : 'transparent',
                            color: active ? theme.bg : theme.mute,
                            border: `1px solid ${active ? accent : theme.border}`,
                          }}>{p}%</button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
