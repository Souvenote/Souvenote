'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  trustCirclesApi,
  contactsApi,
  type TrustCircle,
  type TrustCircleMember,
  type Contact,
  type CreateContactPayload,
} from '@/lib/api';

// ── Modal primitives ──────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
      />
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        {...props}
        rows={3}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
      />
    </div>
  );
}

function Btn({ variant = 'primary', ...props }: { variant?: 'primary' | 'danger' | 'ghost' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50';
  const styles = {
    primary: 'bg-pink-500 hover:bg-pink-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  };
  return <button {...props} className={`${base} ${styles[variant]} ${props.className ?? ''}`} />;
}

// ── Trust Circles ──────────────────────────────────────────────────────────────

function TrustCirclesSection({ currentUserId }: { currentUserId: string }) {
  const [circles, setCircles] = useState<TrustCircle[]>([]);
  const [members, setMembers] = useState<Record<string, TrustCircleMember[]>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Circle modal
  const [showCreate, setShowCreate] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [creating, setCreating] = useState(false);

  // Invite Member modal
  const [inviteCircleId, setInviteCircleId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  const fetchCircles = useCallback(async () => {
    try {
      const data = await trustCirclesApi.getMyCircles();
      setCircles(data);
    } catch {
      setError('Failed to load circles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCircles(); }, [fetchCircles]);

  const fetchMembers = async (circleId: string) => {
    if (members[circleId]) return;
    try {
      const data = await trustCirclesApi.getMembers(circleId);
      setMembers((prev) => ({ ...prev, [circleId]: data }));
    } catch {
      // silently ignore
    }
  };

  const toggleExpand = (circleId: string) => {
    if (expandedId === circleId) {
      setExpandedId(null);
    } else {
      setExpandedId(circleId);
      fetchMembers(circleId);
    }
  };

  const handleCreate = async () => {
    if (!newCircleName.trim()) return;
    setCreating(true);
    try {
      await trustCirclesApi.createCircle(newCircleName.trim());
      setNewCircleName('');
      setShowCreate(false);
      fetchCircles();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteCircleId || !inviteEmail.trim()) return;
    setInviting(true);
    setInviteMsg('');
    try {
      await trustCirclesApi.inviteMember(inviteCircleId, inviteEmail.trim());
      setInviteMsg('Invitation sent!');
      setInviteEmail('');
      setMembers((prev) => ({ ...prev, [inviteCircleId]: [] }));
      setTimeout(() => { setInviteCircleId(null); setInviteMsg(''); }, 1500);
    } catch {
      setInviteMsg('Failed to send invite.');
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteCircle = async (circleId: string) => {
    if (!confirm('Delete this circle and all its members?')) return;
    try {
      await trustCirclesApi.deleteCircle(circleId);
      setCircles((prev) => prev.filter((c) => c.id !== circleId));
      if (expandedId === circleId) setExpandedId(null);
    } catch {
      // ignore
    }
  };

  const handleRemoveMember = async (circleId: string, memberId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await trustCirclesApi.removeMember(circleId, memberId);
      setMembers((prev) => ({
        ...prev,
        [circleId]: (prev[circleId] ?? []).filter((m) => m.id !== memberId),
      }));
    } catch {
      // ignore
    }
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Trust Circles</h2>
        <Btn onClick={() => setShowCreate(true)}>+ New Circle</Btn>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}

      {!loading && circles.length === 0 && (
        <p className="text-gray-400 text-sm">No circles yet. Create one to coordinate occasions with friends.</p>
      )}

      <div className="space-y-3">
        {circles.map((circle) => {
          const isOwner = circle.ownerUserId === currentUserId;
          const isExpanded = expandedId === circle.id;
          const circleMembers = members[circle.id] ?? [];

          return (
            <div key={circle.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(circle.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{circle.name}</span>
                  {!isOwner && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Member</span>
                  )}
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {isOwner && (
                    <>
                      <Btn
                        variant="ghost"
                        className="text-xs py-1 px-3"
                        onClick={() => { setInviteCircleId(circle.id); setInviteEmail(''); setInviteMsg(''); }}
                      >
                        Invite
                      </Btn>
                      <Btn
                        variant="danger"
                        className="text-xs py-1 px-3"
                        onClick={() => handleDeleteCircle(circle.id)}
                      >
                        Delete
                      </Btn>
                    </>
                  )}
                  <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  {circleMembers.length === 0 ? (
                    <p className="text-gray-400 text-sm">No members yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {circleMembers.map((m) => (
                        <li key={m.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-800">{m.invitedEmail}</span>
                            <span
                              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                m.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {m.status}
                            </span>
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => handleRemoveMember(circle.id, m.id)}
                              className="text-red-400 hover:text-red-600 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCreate && (
        <Modal title="Create a Circle" onClose={() => setShowCreate(false)}>
          <Input
            label="Circle Name"
            placeholder="e.g. Family, Close Friends"
            value={newCircleName}
            onChange={(e) => setNewCircleName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} disabled={creating || !newCircleName.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Btn>
          </div>
        </Modal>
      )}

      {inviteCircleId && (
        <Modal title="Invite Member" onClose={() => setInviteCircleId(null)}>
          <Input
            label="Email Address"
            type="email"
            placeholder="friend@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          />
          {inviteMsg && (
            <p className={`text-sm mb-3 ${inviteMsg.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>
              {inviteMsg}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setInviteCircleId(null)}>Cancel</Btn>
            <Btn onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
              {inviting ? 'Sending...' : 'Send Invite'}
            </Btn>
          </div>
        </Modal>
      )}
    </section>
  );
}

// ── Contacts ───────────────────────────────────────────────────────────────────

function ContactsSection() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState<CreateContactPayload>({ contactName: '' });
  const [saving, setSaving] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await contactsApi.getContacts();
      setContacts(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const openAdd = () => {
    setForm({ contactName: '' });
    setEditing(null);
    setShowAdd(true);
  };

  const openEdit = (contact: Contact) => {
    setForm({
      contactName: contact.contactName,
      contactEmail: contact.contactEmail ?? '',
      contactBirthday: contact.contactBirthday ?? '',
      mailingAddress: contact.mailingAddress ?? '',
      notes: contact.notes ?? '',
    });
    setEditing(contact);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.contactName.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await contactsApi.updateContact(editing.id, form);
        setContacts((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      } else {
        const created = await contactsApi.createContact(form);
        setContacts((prev) => [...prev, created].sort((a, b) => a.contactName.localeCompare(b.contactName)));
      }
      setShowAdd(false);
      setEditing(null);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await contactsApi.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Contacts</h2>
        <Btn onClick={openAdd}>+ Add Contact</Btn>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}

      {!loading && contacts.length === 0 && (
        <p className="text-gray-400 text-sm">No contacts yet. Add people to quickly address cards.</p>
      )}

      <div className="space-y-2">
        {contacts.map((contact) => (
          <div key={contact.id} className="flex items-start justify-between border border-gray-200 rounded-xl px-4 py-3">
            <div>
              <p className="font-medium text-gray-800">{contact.contactName}</p>
              {contact.contactEmail && <p className="text-sm text-gray-500">{contact.contactEmail}</p>}
              {contact.contactBirthday && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Birthday: {new Date(contact.contactBirthday + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
              )}
              {contact.mailingAddress && (
                <p className="text-xs text-gray-400 mt-0.5 whitespace-pre-line">{contact.mailingAddress}</p>
              )}
            </div>
            <div className="flex gap-2 ml-4 shrink-0">
              <button onClick={() => openEdit(contact)} className="text-sm text-pink-500 hover:text-pink-700">Edit</button>
              <button onClick={() => handleDelete(contact.id)} className="text-sm text-red-400 hover:text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <Modal
          title={editing ? 'Edit Contact' : 'Add Contact'}
          onClose={() => { setShowAdd(false); setEditing(null); }}
        >
          <Input
            label="Full Name *"
            placeholder="Jane Smith"
            value={form.contactName}
            onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            placeholder="jane@example.com"
            value={form.contactEmail ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
          />
          <Input
            label="Birthday"
            type="date"
            value={form.contactBirthday ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, contactBirthday: e.target.value }))}
          />
          <Textarea
            label="Mailing Address"
            placeholder="123 Main St&#10;Toronto, ON M5V 3A8"
            value={form.mailingAddress ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, mailingAddress: e.target.value }))}
          />
          <Textarea
            label="Notes"
            placeholder="Any notes about this person..."
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving || !form.contactName.trim()}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Contact'}
            </Btn>
          </div>
        </Modal>
      )}
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'accepting' | 'success' | 'error'>('idle');

  useEffect(() => {
    const inviteToken = searchParams.get('invite');
    if (!inviteToken || !user) return;

    setInviteStatus('accepting');
    trustCirclesApi
      .acceptInvite(inviteToken)
      .then(() => {
        setInviteStatus('success');
        router.replace('/account');
      })
      .catch(() => {
        setInviteStatus('error');
        router.replace('/account');
      });
  }, [searchParams, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please sign in to view your account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-500 mb-8">{user.email}</p>

        {inviteStatus === 'accepting' && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
            Accepting circle invitation...
          </div>
        )}
        {inviteStatus === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
            You have joined the circle!
          </div>
        )}
        {inviteStatus === 'error' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            Could not accept the invitation. It may have already been used or expired.
          </div>
        )}

        <TrustCirclesSection currentUserId={user.userId} />
        <ContactsSection />
      </div>
    </div>
  );
}
