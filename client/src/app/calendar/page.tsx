'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import request from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  circleId?: string | null;
  occasionPersonId?: string | null;
  reminderOffsetDays: number;
  reminderSent: boolean;
  createdAt: string;
}

interface Contact {
  id: string;
  contactName: string;
  contactEmail?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Add event form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    reminderOffsetDays: 7,
    occasionPersonId: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoadingEvents(true);
    try {
      const [evts, ctcs] = await Promise.all([
        request<CalendarEvent[]>('/calendar/events'),
        request<Contact[]>('/contacts'),
      ]);
      setEvents(evts);
      setContacts(ctcs);
    } catch {
      // silently fail
    } finally {
      setLoadingEvents(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const eventsThisMonth = events.filter((e) => {
    const d = new Date(e.eventDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const eventsByDay: Record<number, CalendarEvent[]> = {};
  eventsThisMonth.forEach((e) => {
    const day = new Date(e.eventDate).getDate();
    if (!eventsByDay[day]) eventsByDay[day] = [];
    eventsByDay[day].push(e);
  });

  const upcomingEvents = [...events]
    .filter((e) => new Date(e.eventDate) >= today)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  const openAddModal = (date?: string) => {
    setForm({
      title: '',
      description: '',
      eventDate: date || '',
      reminderOffsetDays: 7,
      occasionPersonId: '',
    });
    setShowAddModal(true);
  };

  const handleSaveEvent = async () => {
    if (!form.title || !form.eventDate) return;
    setSaving(true);
    try {
      await request('/calendar/events', {
        method: 'POST',
        body: {
          title: form.title,
          description: form.description || undefined,
          eventDate: form.eventDate,
          reminderOffsetDays: form.reminderOffsetDays,
          occasionPersonId: form.occasionPersonId || undefined,
        },
      });
      await loadData();
      setShowAddModal(false);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await request(`/calendar/events/${id}`, { method: 'DELETE' });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {}
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const calendarCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
          <button
            onClick={() => openAddModal()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          >
            + Add Event
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-6">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">‹</button>
              <h2 className="text-lg font-semibold text-gray-800">
                {MONTHS[month]} {year}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">›</button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, i) => {
                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();
                const dayEvents = day ? eventsByDay[day] || [] : [];
                const dateStr = day
                  ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  : '';

                return (
                  <div
                    key={i}
                    onClick={() => day && openAddModal(dateStr)}
                    className={`min-h-[64px] rounded-lg p-1 cursor-pointer hover:bg-purple-50 transition-colors ${
                      isToday ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-gray-50'
                    } ${!day ? 'opacity-0 pointer-events-none' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-xs font-medium mb-1 ${isToday ? 'text-purple-700' : 'text-gray-600'}`}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map((e) => (
                            <div
                              key={e.id}
                              onClick={(ev) => { ev.stopPropagation(); }}
                              className={`text-[10px] truncate rounded px-1 py-0.5 ${
                                e.circleId
                                  ? 'bg-pink-200 text-pink-800'
                                  : 'bg-purple-200 text-purple-800'
                              }`}
                              title={e.title}
                            >
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-gray-400">+{dayEvents.length - 2}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-purple-200 inline-block" />
                Personal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-pink-200 inline-block" />
                Circle
              </span>
            </div>
          </div>

          {/* Sidebar — upcoming events */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Upcoming</h3>
            {loadingEvents ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-sm text-gray-400">No upcoming events</div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((e) => (
                  <div key={e.id} className="group">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{e.title}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(e.eventDate).toLocaleDateString('en-CA', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(e.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Event</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Event title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Who is this for?</label>
                <select
                  value={form.occasionPersonId}
                  onChange={(e) => setForm((f) => ({ ...f, occasionPersonId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">— Select a contact —</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.contactName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder (days before)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.reminderOffsetDays}
                  onChange={(e) => setForm((f) => ({ ...f, reminderOffsetDays: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                disabled={saving || !form.title || !form.eventDate}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl py-2 text-sm font-medium transition"
              >
                {saving ? 'Saving...' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
