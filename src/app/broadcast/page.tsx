'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BroadcastPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  
  const [deviceCount, setDeviceCount] = useState<number | null>(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    body: '',
    url: ''
  });

  useEffect(() => {
    const savedPin = sessionStorage.getItem('admin_pin');
    const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || '7860';
    if (savedPin === correctPin) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetch('/api/admin/devices')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.count === 'number') {
            setDeviceCount(data.count);
          }
        })
        .catch(err => console.error('Failed to fetch device count', err));
    }
  }, [isAuthorized]);

  const handleSubmitPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || '7860';
    if (pin === correctPin) {
      setIsAuthorized(true);
      sessionStorage.setItem('admin_pin', pin);
      setPinError(false);
      setPin('');
    } else {
      setPinError(true);
      setPin('');
      setTimeout(() => setPinError(false), 500);
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!broadcastForm.title || !broadcastForm.body) {
      setError('Please fill in title and body.');
      return;
    }
    
    if (!confirm(`Are you sure you want to send this broadcast to ALL ${deviceCount || 0} registered devices?`)) {
      return;
    }

    setBroadcasting(true);
    try {
      const savedPin = sessionStorage.getItem('admin_pin') || '';
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...broadcastForm, pin: savedPin })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Broadcast failed.');
      setMessage(data.message || 'Broadcast sent successfully.');
      setBroadcastForm({ title: '', body: '', url: '' });
    } catch (err: any) {
      setError(err.message || 'Error sending broadcast.');
    } finally {
      setBroadcasting(false);
    }
  };

  if (isAuthorized === null) return null;

  if (!isAuthorized) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: pinError ? 'shake 0.5s' : 'none'
      }}>
        <div style={{
          background: 'var(--surface)',
          padding: '40px',
          borderRadius: '24px',
          border: '1px solid var(--line)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'var(--maroon)',
            color: 'var(--bg)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', margin: '0 0 12px 0' }}>Broadcast Access</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
            Please enter the administrator PIN to access the broadcast panel.
          </p>
          <form onSubmit={handleSubmitPin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '24px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  background: 'var(--bg)',
                  border: pinError ? '1px solid var(--maroon)' : '1px solid var(--line)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              />
            </div>
            {pinError && (
              <div style={{ color: 'var(--maroon)', fontSize: '14px', marginTop: '-10px' }}>
                Incorrect PIN. Please try again.
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '16px', fontSize: '16px', fontWeight: 600 }}
            >
              Verify PIN
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--text)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            AZ
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', margin: 0, letterSpacing: '-0.5px' }}>AzaHub</h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)' }}>Broadcast Panel</p>
          </div>
        </div>
        <Link href="/admin" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          Full Admin
        </Link>
      </header>

      <main style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
        {error && (
          <div style={{ padding: '16px', background: '#ff572222', color: '#ff5722', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ff572244' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {message && (
          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <strong>Success:</strong> {message}
          </div>
        )}

        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: '0px', padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', marginTop: 0, marginBottom: '12px' }}>
            Push Notifications
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '32px', lineHeight: 1.5 }}>
            Send an instant push notification to all users who have registered a reminder device. Use this for major announcements or urgent schedule changes.
          </p>

          <div style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '0px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '4px' }}>Registered Devices</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text)' }}>
                {deviceCount === null ? '...' : deviceCount}
              </div>
            </div>
            <div style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)', padding: '8px 16px', borderRadius: '0px', fontSize: '13px', fontWeight: 'bold', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              Web Push Ready
            </div>
          </div>

          <form onSubmit={handleBroadcastSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 600 }}>Notification Title *</label>
              <input
                type="text"
                placeholder="e.g. Majlis Location Changed"
                value={broadcastForm.title}
                onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                style={{ width: '100%', padding: '16px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '0px', color: 'var(--text)', fontSize: '16px' }}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 600 }}>Notification Body *</label>
              <textarea
                placeholder="e.g. Tonight's majlis at Imamia Manzil will now start at 9:00 PM."
                value={broadcastForm.body}
                onChange={e => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                style={{ width: '100%', padding: '16px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '0px', color: 'var(--text)', minHeight: '120px', resize: 'vertical', fontSize: '16px' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 600 }}>Deep Link (Optional)</label>
              <input
                type="text"
                placeholder="e.g. /events/ev123"
                value={broadcastForm.url}
                onChange={e => setBroadcastForm({ ...broadcastForm, url: e.target.value })}
                style={{ width: '100%', padding: '16px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '0px', color: 'var(--text)', fontSize: '16px' }}
              />
            </div>

            <button
              type="submit"
              disabled={broadcasting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '20px',
                fontSize: '16px',
                fontWeight: 600,
                marginTop: '16px',
                background: 'var(--maroon)',
                borderColor: 'var(--maroon)',
                borderRadius: '0px',
                opacity: broadcasting ? 0.7 : 1
              }}
            >
              {broadcasting ? 'Sending...' : 'SEND BROADCAST TO ALL DEVICES'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
