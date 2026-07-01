'use client';

import React, { useState } from 'react';
import { requestForToken } from '@/lib/firebase';
import { getSupabaseClient, supabase } from '@/lib/supabase';

export function RemindMeButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleRemindMe = async () => {
    if (!supabase) {
      alert("Database is not connected.");
      return;
    }
    
    setLoading(true);
    setStatus('idle');
    try {
      const { token, error: tokenError } = await requestForToken();
      if (!token) {
        if (tokenError === 'not_supported') {
          alert('On iPhone, you MUST add this website to your Home Screen to receive notifications (Share -> Add to Home Screen).');
        } else if (tokenError === 'denied') {
          alert('Notification permission is required. Please enable it in your browser settings.');
        } else {
          alert(`Failed to get push token: ${tokenError || 'Unknown error'}`);
        }
        setLoading(false);
        return;
      }

      // We need a unique device id, we can generate a random one or use a simple uuid
      let deviceId = localStorage.getItem('azadar_device_id');
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('azadar_device_id', deviceId);
      }

      const client = getSupabaseClient(deviceId);
      if (!client) {
        throw new Error('Supabase client not initialized');
      }

      // Upsert into reminders for the special "doddaballapur_route" event
      const { error } = await client
        .from('reminders')
        .upsert({
          device_id: deviceId,
          fcm_token: token,
          event_id: 'doddaballapur_route',
          venue_name: 'Doddaballapur Sabeel Route',
          starts_in: 'when live',
          venue_maps_link: '',
          event_time: new Date().toISOString(), // Dummy date
          reminder_time: new Date().toISOString(), // Dummy date
          status: 'pending'
        }, { onConflict: 'device_id, event_id, reminder_time' });

      if (error) {
        throw error;
      }

      setStatus('success');
      setMessage('✓ You will be notified when the route map is live!');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Failed to set reminder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {status === 'success' ? (
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          color: '#22c55e',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          padding: '16px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          {message}
        </div>
      ) : (
        <button
          onClick={handleRemindMe}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '16px',
            background: 'var(--maroon)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: '0px',
            fontWeight: 600,
            fontSize: '15px',
            marginBottom: '24px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {loading ? 'Setting up...' : 'Remind Me When Live'}
        </button>
      )}
      
      {status === 'error' && (
        <div style={{ color: 'var(--maroon)', fontSize: '13px', marginTop: '-12px', marginBottom: '24px' }}>
          {message}
        </div>
      )}
    </div>
  );
}
