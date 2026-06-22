'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Venue, Event, Day } from '@/types';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [days, setDays] = useState<Day[]>([]);

  const [activeTab, setActiveTab] = useState<'events' | 'venues'>('events');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Authentication states
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Check authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem('admin_authenticated');
      if (isAuth === 'true') {
        setAuthenticated(true);
      }
      setCheckingAuth(false);
    }
  }, []);

  const handleSubmitPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || '1210';
    if (pin === correctPin) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setAuthenticated(true);
      setPinError(false);
      setPin('');
    } else {
      setPinError(true);
      setPin('');
      setTimeout(() => setPinError(false), 500);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setAuthenticated(false);
  };

  // Search filter states
  const [eventSearch, setEventSearch] = useState<string>('');
  const [venueSearch, setVenueSearch] = useState<string>('');

  // Form states for Venue CRUD
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [venueForm, setVenueForm] = useState({
    id: '',
    name: '',
    area: '',
    maps_query: '',
    type: 'azakhana',
    zone: '',
    photo_url: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Form states for Event CRUD
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    id: '',
    venue_id: '',
    location_detail: '',
    date_type: 'regular',
    date_iso: '',
    day_numbers_str: '',
    date_label: '',
    time: '',
    time_24h: '',
    minjanib: '',
    bayan_by: '',
    notes: '',
    youtube_url: '',
    is_procession: false
  });

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [venuesRes, eventsRes] = await Promise.all([
          fetch('/api/venues'),
          fetch('/api/events')
        ]);

        if (!venuesRes.ok || !eventsRes.ok) {
          throw new Error('Failed to load data from server.');
        }

        const venuesData = await venuesRes.json();
        const eventsData = await eventsRes.json();

        setVenues(venuesData);
        setEvents(eventsData);

        // Fetch days for validation dropdowns or calculations (mocked/static days matches config)
        // Since days don't change often, we can hardcode or load them from local state
        // Let's create a list of 31 days corresponding to standard data
        const generatedDays: Day[] = [];
        // Chand Raat is day 0
        generatedDays.push({ day: 0, date_iso: '2026-06-16', weekday: 'Tue', label: 'Chand Raat', tag: null });
        // Day 1 to 30
        const startDay = new Date('2026-06-17T00:00:00+05:30');
        const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let d = 1; d <= 30; d++) {
          const dateObj = new Date(startDay.getTime() + (d - 1) * 86400000);
          const iso = dateObj.toISOString().split('T')[0];
          const tag = d === 1 ? 'Sar-e-Moharram' : d === 9 ? 'Shab-e-Ashoor' : d === 10 ? 'Ashura' : null;
          generatedDays.push({
            day: d,
            date_iso: iso,
            weekday: weekdayNames[dateObj.getDay()],
            label: String(d),
            tag
          });
        }
        setDays(generatedDays);
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Pre-index venues for easy event table displaying
  const venuesById = useMemo(() => {
    const map: Record<string, Venue> = {};
    venues.forEach(v => {
      map[v.id] = v;
    });
    return map;
  }, [venues]);

  // Filters
  const filteredEvents = useMemo(() => {
    if (!eventSearch) return events;
    const q = eventSearch.toLowerCase();
    return events.filter(e => {
      const vName = venuesById[e.venue_id]?.name?.toLowerCase() || '';
      return (
        e.id.toLowerCase().includes(q) ||
        vName.includes(q) ||
        (e.date_label && e.date_label.toLowerCase().includes(q)) ||
        (e.minjanib && e.minjanib.toLowerCase().includes(q)) ||
        (e.bayan_by && e.bayan_by.toLowerCase().includes(q))
      );
    });
  }, [events, eventSearch, venuesById]);

  const filteredVenues = useMemo(() => {
    if (!venueSearch) return venues;
    const q = venueSearch.toLowerCase();
    return venues.filter(v =>
      v.id.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      v.area.toLowerCase().includes(q) ||
      v.zone.toLowerCase().includes(q)
    );
  }, [venues, venueSearch]);

  // Venue Form Submit (Create / Update)
  const handleVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!venueForm.id || !venueForm.name || !venueForm.area || !venueForm.maps_query || !venueForm.zone) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      action: editingVenueId ? 'update' : 'create',
      data: {
        id: venueForm.id.trim(),
        name: venueForm.name.trim(),
        area: venueForm.area.trim(),
        maps_query: venueForm.maps_query.trim(),
        type: venueForm.type,
        zone: venueForm.zone.trim(),
        lat: null,
        lng: null,
        photo_url: venueForm.photo_url.trim() || null
      }
    };

    try {
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Server error saving venue.');
      }

      setVenues(resData.venues);
      setMessage(editingVenueId ? 'Venue updated successfully.' : 'Venue created successfully.');
      resetVenueForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save venue.');
    }
  };

  // Delete Venue
  const handleDeleteVenue = async (id: string) => {
    if (!confirm('Are you sure you want to delete this venue? This does not delete associated events, which may break display.')) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Server error deleting venue.');
      }

      setVenues(resData.venues);
      setMessage('Venue deleted successfully.');
      if (editingVenueId === id) resetVenueForm();
    } catch (err: any) {
      setError(err.message || 'Failed to delete venue.');
    }
  };

  // Toggle Venue Visibility (Hide/Unhide)
  const handleToggleVenueVisibility = async (v: Venue) => {
    setError(null);
    setMessage(null);

    const updatedVenue = { ...v, hidden: !v.hidden };
    const payload = {
      action: 'update',
      data: updatedVenue
    };

    try {
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Server error toggling venue visibility.');
      }

      setVenues(resData.venues);
      setMessage(`Venue "${v.name}" is now ${updatedVenue.hidden ? 'hidden' : 'visible'}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle venue visibility.');
    }
  };

  const handleEditVenue = (v: Venue) => {
    setEditingVenueId(v.id);
    setVenueForm({
      id: v.id,
      name: v.name,
      area: v.area,
      maps_query: v.maps_query,
      type: v.type,
      zone: v.zone,
      photo_url: v.photo_url || ''
    });
  };

  const resetVenueForm = () => {
    setEditingVenueId(null);
    setVenueForm({
      id: '',
      name: '',
      area: '',
      maps_query: '',
      type: 'azakhana',
      zone: '',
      photo_url: ''
    });
  };

  // Photo upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!supabase) {
      setError('Photo upload requires Supabase. Please configure your environment variables.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP, etc.).');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    setUploadingPhoto(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${venueForm.id || 'venue'}-${Date.now()}.${fileExt}`;
      const filePath = `venues/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('venue-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: urlData } = supabase.storage
        .from('venue-photos')
        .getPublicUrl(filePath);

      setVenueForm(prev => ({ ...prev, photo_url: urlData.publicUrl }));
      setMessage('Photo uploaded successfully!');
    } catch (err: any) {
      setError(`Photo upload failed: ${err.message}`);
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // Event Form Submit (Create / Update)
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!eventForm.id || !eventForm.venue_id || !eventForm.date_label || !eventForm.time) {
      setError('Please fill in all required fields (ID, Venue, Date Label, Time).');
      return;
    }

    // Parse comma-separated day numbers
    const dayNumbers = eventForm.day_numbers_str
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));

    if (dayNumbers.length === 0) {
      setError('Please provide at least one valid day number (e.g. 1 or 5,12).');
      return;
    }

    const payload = {
      action: editingEventId ? 'update' : 'create',
      data: {
        id: eventForm.id.trim(),
        venue_id: eventForm.venue_id,
        location_detail: eventForm.location_detail.trim() || null,
        date_type: eventForm.date_type,
        date_iso: eventForm.date_iso ? eventForm.date_iso : null,
        day_numbers: dayNumbers,
        date_label: eventForm.date_label.trim(),
        time: eventForm.time.trim(),
        time_24h: eventForm.time_24h.trim() || null,
        minjanib: eventForm.minjanib.trim(),
        bayan_by: eventForm.bayan_by.trim(),
        notes: eventForm.notes.trim(),
        youtube_url: eventForm.youtube_url.trim(),
        is_procession: eventForm.is_procession
      }
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Server error saving event.');
      }

      setEvents(resData.events);
      setMessage(editingEventId ? 'Event updated successfully.' : 'Event created successfully.');
      resetEventForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save event.');
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Server error deleting event.');
      }

      setEvents(resData.events);
      setMessage('Event deleted successfully.');
      if (editingEventId === id) resetEventForm();
    } catch (err: any) {
      setError(err.message || 'Failed to delete event.');
    }
  };

  const handleEditEvent = (ev: Event) => {
    setEditingEventId(ev.id);
    setEventForm({
      id: ev.id,
      venue_id: ev.venue_id,
      location_detail: ev.location_detail || '',
      date_type: ev.date_type,
      date_iso: ev.date_iso || '',
      day_numbers_str: ev.day_numbers ? ev.day_numbers.join(', ') : '',
      date_label: ev.date_label || '',
      time: ev.time || '',
      time_24h: ev.time_24h || '',
      minjanib: ev.minjanib || '',
      bayan_by: ev.bayan_by || '',
      notes: ev.notes || '',
      youtube_url: ev.youtube_url || '',
      is_procession: !!ev.is_procession
    });
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEventForm({
      id: '',
      venue_id: venues[0]?.id || '',
      location_detail: '',
      date_type: 'regular',
      date_iso: '',
      day_numbers_str: '',
      date_label: '',
      time: '',
      time_24h: '',
      minjanib: '',
      bayan_by: '',
      notes: '',
      youtube_url: '',
      is_procession: false
    });
  };

  // Helper to pre-populate event dates when selection changes
  const handleEventDayNumChange = (str: string) => {
    setEventForm(prev => {
      const dayNum = parseInt(str.trim(), 10);
      const matchedDayObj = days.find(d => d.day === dayNum);

      // Auto-fill values on best effort
      return {
        ...prev,
        day_numbers_str: str,
        date_iso: matchedDayObj ? matchedDayObj.date_iso : prev.date_iso,
        date_label: matchedDayObj
          ? (matchedDayObj.day === 0 ? 'Moharram Chand Raat' : `${matchedDayObj.label} Moharram`)
          : prev.date_label
      };
    });
  };

  if (checkingAuth) {
    return (
      <div className="empty-state" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-dim)' }}>Checking authentication...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, rgba(201, 162, 77, 0.08) 0%, var(--bg) 70%)',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '380px',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 30px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          animation: pinError ? 'shake 0.5s' : 'none'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--gold-soft)',
            border: '1px solid var(--gold-line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '0 0 10px', color: 'var(--text)' }}>
            Admin Verification
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', margin: '0 0 30px', lineHeight: 1.5 }}>
            Please enter the administrator PIN to access the database panel.
          </p>

          <form onSubmit={handleSubmitPin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              autoFocus
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--surface-2)',
                border: pinError ? '1px solid var(--maroon)' : '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text)',
                fontSize: '24px',
                letterSpacing: '12px',
                textAlign: 'center',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'monospace'
              }}
            />

            {pinError && (
              <p style={{ color: '#ff5722', fontSize: '13px', margin: 0 }}>
                Incorrect PIN. Please try again.
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 600,
                marginTop: '10px'
              }}
            >
              Verify PIN
            </button>
          </form>

          <Link href="/" style={{ display: 'inline-block', marginTop: '24px', color: 'var(--text-dim)', fontSize: '13px', textDecoration: 'none' }}>
            ← Back to Schedule
          </Link>

          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              20%, 60% { transform: translateX(-8px); }
              40%, 80% { transform: translateX(8px); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="empty-state" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading database components...</p>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)', color: 'var(--text)' }}>
      {/* Header */}
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-title)', margin: 0, fontSize: '24px' }}>Database Administrator Panel</h1>
          <p style={{ margin: '5px 0 0', color: 'var(--text-dim)', fontSize: '13px' }}>Update schedule entries and venue listings</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Logout
          </button>
          <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            ← Back to Schedule
          </Link>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div style={{ background: '#f4433622', border: '1px solid #f44336', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#f44336' }}>
          <b>Error:</b> {error}
        </div>
      )}
      {message && (
        <div style={{ background: '#4caf5022', border: '1px solid #4caf50', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#4caf50' }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className={`zone-chip ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => { setActiveTab('events'); setError(null); setMessage(null); }}
          style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '14px' }}
        >
          Manage Events ({events.length})
        </button>
        <button
          className={`zone-chip ${activeTab === 'venues' ? 'active' : ''}`}
          onClick={() => { setActiveTab('venues'); setError(null); setMessage(null); }}
          style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '14px' }}
        >
          Manage Venues ({venues.length})
        </button>
      </div>

      {/* Admin Body splits into Form and List */}
      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>

        {/* ================= MANAGE EVENTS TABS ================= */}
        {activeTab === 'events' && (
          <>
            {/* Left Col: Event Form */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                {editingEventId ? `Edit Event: ${editingEventId}` : 'Add New Event'}
              </h2>

              <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Event ID *</label>
                    <input
                      type="text"
                      value={eventForm.id}
                      onChange={e => setEventForm({ ...eventForm, id: e.target.value })}
                      disabled={editingEventId !== null}
                      placeholder="e.g. ev226"
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Venue *</label>
                    <select
                      value={eventForm.venue_id}
                      onChange={e => setEventForm({ ...eventForm, venue_id: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                      required
                    >
                      <option value="">-- Select Venue --</option>
                      {venues.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.area})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Day Numbers * (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 or 5, 12"
                      value={eventForm.day_numbers_str}
                      onChange={e => handleEventDayNumChange(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Date ISO (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      value={eventForm.date_iso}
                      onChange={e => setEventForm({ ...eventForm, date_iso: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Date Type</label>
                    <select
                      value={eventForm.date_type}
                      onChange={e => setEventForm({ ...eventForm, date_type: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                    >
                      <option value="regular">Regular</option>
                      <option value="special">Special</option>
                      <option value="shab_e_ashoor">Shab e Ashoor</option>
                      <option value="ashoor">Ashura</option>
                      <option value="recurring_range">Recurring Range</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Date Label *</label>
                    <input
                      type="text"
                      placeholder="e.g. 5th Moharram"
                      value={eventForm.date_label}
                      onChange={e => setEventForm({ ...eventForm, date_label: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Display Time *</label>
                    <input
                      type="text"
                      placeholder="e.g. 7:15 PM"
                      value={eventForm.time}
                      onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Time 24h (HH:MM) - for live pills</label>
                    <input
                      type="text"
                      placeholder="e.g. 19:15"
                      value={eventForm.time_24h}
                      onChange={e => setEventForm({ ...eventForm, time_24h: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Minjanib (Organizers)</label>
                  <input
                    type="text"
                    value={eventForm.minjanib}
                    onChange={e => setEventForm({ ...eventForm, minjanib: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Bayan By (Orator)</label>
                  <input
                    type="text"
                    value={eventForm.bayan_by}
                    onChange={e => setEventForm({ ...eventForm, bayan_by: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Location Detail (Hall, Road etc.)</label>
                    <input
                      type="text"
                      placeholder="e.g. Ground Floor"
                      value={eventForm.location_detail}
                      onChange={e => setEventForm({ ...eventForm, location_detail: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>YouTube Streaming URL</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/..."
                      value={eventForm.youtube_url}
                      onChange={e => setEventForm({ ...eventForm, youtube_url: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Notes / Descriptions</label>
                  <textarea
                    value={eventForm.notes}
                    onChange={e => setEventForm({ ...eventForm, notes: e.target.value })}
                    rows={2}
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0' }}>
                  <input
                    type="checkbox"
                    id="is_procession"
                    checked={eventForm.is_procession}
                    onChange={e => setEventForm({ ...eventForm, is_procession: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="is_procession" style={{ fontSize: '14px', cursor: 'pointer' }}>Matami Juloos (Procession Event)</label>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                    {editingEventId ? 'Save Changes' : 'Create Event'}
                  </button>
                  <button type="button" onClick={resetEventForm} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Right Col: Events list */}
            <div>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Search events by id, venue, orator, minjanib..."
                  value={eventSearch}
                  onChange={e => setEventSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                />
              </div>

              <div style={{ maxHeight: '75vh', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: '12px' }}>
                {filteredEvents.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px' }}>No events match search.</div>
                ) : (
                  filteredEvents.map(ev => {
                    const venue = venuesById[ev.venue_id];
                    return (
                      <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid var(--line)', background: 'var(--surface-1)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '70%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 'bold' }}>{ev.id}</span>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{venue ? venue.name : 'Unknown Venue'}</span>
                          </div>
                          <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                            {ev.date_label} · {ev.time}
                          </span>
                          {ev.minjanib && (
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                              <b>Minjanib:</b> {ev.minjanib}
                            </span>
                          )}
                          {ev.bayan_by && (
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                              <b>Bayan:</b> {ev.bayan_by}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditEvent(ev)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteEvent(ev.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: '#ff5722', borderColor: '#ff5722' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* ================= MANAGE VENUES TABS ================= */}
        {activeTab === 'venues' && (
          <>
            {/* Left Col: Venue Form */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                {editingVenueId ? `Edit Venue: ${editingVenueId}` : 'Add New Venue'}
              </h2>

              <form onSubmit={handleVenueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Venue ID * (lowercase, hyphens)</label>
                  <input
                    type="text"
                    value={venueForm.id}
                    onChange={e => setVenueForm({ ...venueForm, id: e.target.value })}
                    disabled={editingVenueId !== null}
                    placeholder="e.g. masjid-e-fatima"
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Venue Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Masjid-e-Fatima"
                    value={venueForm.name}
                    onChange={e => setVenueForm({ ...venueForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Area *</label>
                    <input
                      type="text"
                      placeholder="e.g. Richmond Town"
                      value={venueForm.area}
                      onChange={e => setVenueForm({ ...venueForm, area: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Zone * (for venue rail)</label>
                    <input
                      type="text"
                      placeholder="e.g. Richmond Town or Hosur Road"
                      value={venueForm.zone}
                      onChange={e => setVenueForm({ ...venueForm, zone: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Venue Type *</label>
                  <select
                    value={venueForm.type}
                    onChange={e => setVenueForm({ ...venueForm, type: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                    required
                  >
                    <option value="masjid">Masjid</option>
                    <option value="imambara">Imambara</option>
                    <option value="azakhana">Azakhana</option>
                    <option value="ashurkhana">Ashurkhana</option>
                    <option value="pandal">Pandal</option>
                    <option value="qabrastan">Qabrastan</option>
                    <option value="service">Service Route</option>
                    <option value="residence">Residence</option>
                    <option value="procession_route">Procession Route</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Google Maps Query *</label>
                  <input
                    type="text"
                    placeholder="e.g. Masjid e Askari Richmond Town"
                    value={venueForm.maps_query}
                    onChange={e => setVenueForm({ ...venueForm, maps_query: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Venue Photo</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Photo URL (or upload below)"
                      value={venueForm.photo_url}
                      onChange={e => setVenueForm({ ...venueForm, photo_url: e.target.value })}
                      style={{ flex: 1, padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                    />
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                      id="venue-photo-upload"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="btn btn-secondary"
                      style={{ padding: '10px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      {uploadingPhoto ? 'Uploading...' : '📷 Upload'}
                    </button>
                  </div>
                  {venueForm.photo_url && (
                    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                      <img
                        src={venueForm.photo_url}
                        alt="Venue preview"
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                    {editingVenueId ? 'Save Changes' : 'Create Venue'}
                  </button>
                  <button type="button" onClick={resetVenueForm} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Right Col: Venues list */}
            <div>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Search venues by id, name, area, zone..."
                  value={venueSearch}
                  onChange={e => setVenueSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }}
                />
              </div>

              <div style={{ maxHeight: '75vh', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: '12px' }}>
                {filteredVenues.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px' }}>No venues match search.</div>
                ) : (
                  filteredVenues.map(v => (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid var(--line)', background: 'var(--surface-1)', opacity: v.hidden ? 0.5 : 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{v.name}</span>
                          {v.hidden && (
                            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#ff572233', color: '#ff5722', borderRadius: '4px', fontWeight: 'bold' }}>HIDDEN</span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'monospace' }}>ID: {v.id}</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                          {v.area} · {v.zone} · Type: <b style={{ textTransform: 'capitalize' }}>{v.type}</b>
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleToggleVenueVisibility(v)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          {v.hidden ? '👁 Show' : '🙈 Hide'}
                        </button>
                        <button onClick={() => handleEditVenue(v)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteVenue(v.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: '#ff5722', borderColor: '#ff5722' }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
