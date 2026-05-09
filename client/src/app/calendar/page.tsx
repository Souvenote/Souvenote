'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  calendarApi,
  trustCirclesApi,
  contactsApi,
  type CalendarEvent,
  type TrustCircle,
  type TrustCircleMember,
  type Contact,
} from '@/lib/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isToday(year: number, month: number, day: number) {
  const today = new Date();
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
}

// ── Modal primitives ──────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <input
        {...rest}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
      />
    </div>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const { label, children, ...rest } = props;
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <select
        {...rest}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
      >
        {children}
      </select>
    </div>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        {...rest}
        rows={2}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
      />
    </div>
  );
}

// ── Add Event Modal ───────────────────────────────────────────────────────────

interface AddEventModalProps {
  defaultDate: string;
  circles: TrustCircle[];
  contacts: Contact[];
  onSave: (data: {
    title: string;
    eventDate: string;
    description?: string;
    reminderOffsetDays: number;
    circleId?: string;
    occasionPersonId?: string;
  }) => Promise<void>;
  onClose: () => void;
}

function AddEventModal({ defaultDate, circles, contacts, onSave, onClose }: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(defaultDate);
  const [description, setDescription] = useState('');
  const [reminderOffsetDays, setReminderOffsetDays] = useState(7);
  const [circleId, setCircleId] = useState('');
  const [occasionPersonId, setOccasionPersonId] = useState('');
  const [circleMembers, setCircleMembers] = useState<TrustCircleMember[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!circleId) { setCircleMembers([]); setOccasionPersonId(''); return; }
    trustCirclesApi.getMembers(circleId).then(setCircleMembers).catch(() => {});
  }, [circleId]);

  const handleSave = async () => {
    if (!title.trim() || !eventDate) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        eventDate,
        description: description.trim() || undefined,
        reminderOffsetDays,
        circleId: circleId || undefined,
        occasionPersonId: occasionPersonId || undefined,
      });
      onClose();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const activeMembers = circleMembers.filter((m) => m.status === 'active' && m.userId);

  return (
    <Modal title="Add Event" onClose={onClose}>
      <Input
        label="Event Title *"
        placeholder="Mom's Birthday"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        label="Date *"
        type="date"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
      />
      <Textarea
        label="Description"
        placeholder="Optional notes..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="mb-4">
        <FieldLabel>Remind me (days before)</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {[1, 3, 7, 14, 30].map((n) => (
            <button
              key={n}
              onClick={() => setReminderOffsetDays(n)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                reminderOffsetDays === n
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {n}d
            </button>
          ))}
        </div>
      </div>

      {circles.length > 0 && (
        <Select
          label="Add to Circle (optional)"
          value={circleId}
          onChange={(e) => setCircleId(e.target.value)}
        >
          <option value="">— Personal only —</option>
          {circles.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      )}

      {circleId && (
        <Select
          label="Who is this for? (optional — notifies all other members)"
          value={occasionPersonId}
          onChange={(e) => setOccasionPersonId(e.target.value)}
        >
          <option value="">— No one specific —</option>
          {activeMembers.map((m) => (
            <option key={m.id} value={m.userId!}>{m.invitedEmail}</option>
          ))}
        </Select>
      )}

      {!circleId && contacts.length > 0 && (
        <div className="mb-4 text-sm text-gray-500">
          Tip: select a circle above to notify members about this occasion.
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 text-gray-700">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !eventDate}
          className="px-4 py-2 rounded-lg text-sm bg-pink-500 hover:bg-pink-600 text-white font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Add Event'}
        </button>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [circles, setCircles] = useState<TrustCircle[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [addEventDate, setAddEventDate] = useState<string | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const [evts, cirs, cons] = await Promise.all([
        calendarApi.getEvents(),
        trustCirclesApi.getMyCircles(),
        contactsApi.getContacts(),
      ]);
      setEvents(evts);
      setCircles(cirs);
      setContacts(cons);
    } catch {
      // ignore
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => { if (user) fetchAll(); }, [user, fetchAll]);

  const visibleEvents = useMemo(() => {
    if (selectedCircleId === null) {
      return events.filter((e) => !e.circleId);
    }
    return events.filter((e) => e.circleId === selectedCircleId);
  }, [events, selectedCircleId]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of visibleEvents) {
      if (!map[e.eventDate]) map[e.eventDate] = [];
      map[e.eventDate].push(e);
    }
    return map;
  }, [visibleEvents]);

  const upcomingEvents = useMemo(() => {
    const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate());
    return [...events]
      .filter((e) => e.eventDate >= todayStr)
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
      .slice(0, 10);
  }, [events]);

  const handlePrevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const handleAddEvent = async (data: Parameters<AddEventModalProps['onSave']>[0]) => {
    const created = await calendarApi.createEvent(data);
    setEvents((prev) => [...prev, created]);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await calendarApi.deleteEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const totalCells = Math.ceil((startDay + numDays) / 7) * 7;

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Please sign in to view your calendar.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: Calendar ── */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 font-bold"
                >
                  ‹
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {MONTHS[month]} {year}
                </h1>
                <button
                  onClick={handleNextMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 font-bold"
                >
                  ›
                </button>
              </div>
              <button
                onClick={() => setAddEventDate(toDateString(year, month, today.getDate()))}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Add Event
              </button>
            </div>

            {/* Circle toggle */}
            <div className="flex gap-2 flex-wrap mb-4">
              <button
                onClick={() => setSelectedCircleId(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedCircleId === null
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                My Calendar
              </button>
              {circles.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCircleId(c.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedCircleId === c.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS.map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {Array.from({ length: totalCells }, (_, i) => {
                  const dayNum = i - startDay + 1;
                  const inMonth = dayNum >= 1 && dayNum <= numDays;
                  const dateStr = inMonth ? toDateString(year, month, dayNum) : '';
                  const dayEvents = inMonth ? (eventsByDate[dateStr] ?? []) : [];
                  const todayCell = inMonth && isToday(year, month, dayNum);

                  return (
                    <div
                      key={i}
                      onClick={() => inMonth && setAddEventDate(dateStr)}
                      className={`min-h-[80px] p-1.5 border-b border-r border-gray-50 cursor-pointer transition-colors ${
                        inMonth ? 'hover:bg-pink-50' : 'bg-gray-50/50'
                      }`}
                    >
                      {inMonth && (
                        <>
                          <div
                            className={`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1 ${
                              todayCell
                                ? 'bg-pink-500 text-white font-bold'
                                : 'text-gray-700'
                            }`}
                          >
                            {dayNum}
                          </div>
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 3).map((ev) => (
                              <div
                                key={ev.id}
                                onClick={(e) => { e.stopPropagation(); }}
                                className={`text-xs px-1.5 py-0.5 rounded truncate flex items-center justify-between group ${
                                  ev.circleId
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-pink-100 text-pink-800'
                                }`}
                                title={ev.title}
                              >
                                <span className="truncate">{ev.title}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }}
                                  className="ml-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-opacity shrink-0"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-gray-400 pl-1">+{dayEvents.length - 3} more</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-pink-200 inline-block" />
                Personal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-200 inline-block" />
                Circle
              </span>
            </div>
          </div>

          {/* ── Right: Upcoming Events ── */}
          <div className="lg:w-64 xl:w-72 shrink-0">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Upcoming</h2>
            {loadingEvents && <p className="text-sm text-gray-400">Loading...</p>}
            {!loadingEvents && upcomingEvents.length === 0 && (
              <p className="text-sm text-gray-400">No upcoming events.</p>
            )}
            <div className="space-y-2">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`rounded-xl px-3 py-2.5 border group relative ${
                    ev.circleId
                      ? 'bg-blue-50 border-blue-100'
                      : 'bg-pink-50 border-pink-100'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800 pr-5 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDisplayDate(ev.eventDate)}</p>
                  {ev.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{ev.description}</p>
                  )}
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity text-base leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {addEventDate !== null && (
        <AddEventModal
          defaultDate={addEventDate}
          circles={circles}
          contacts={contacts}
          onSave={handleAddEvent}
          onClose={() => setAddEventDate(null)}
        />
      )}
    </div>
  );
}
