'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface Sabeel {
  sl_num: number;
  sabeel_name: string;
  location: string;
  contact_person: string;
  contact_num: string;
}

export default function ClientSabeelPage({ sabeels }: { sabeels: Sabeel[] }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sabeels;
    return sabeels.filter(s => 
      s.sabeel_name?.toLowerCase().includes(q) ||
      s.location?.toLowerCase().includes(q) ||
      s.contact_person?.toLowerCase().includes(q) ||
      s.contact_num?.toString().toLowerCase().includes(q)
    );
  }, [search, sabeels]);

  // Clean strings (remove trailing \n, etc.)
  const cleanStr = (s: string | number | undefined | null) => {
    if (s === null || s === undefined) return '';
    return String(s).replace(/\n/g, ' ').replace(/\s\s+/g, ' ').trim();
  };

  // Action helpers
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="app sabeel-app">
      <header className="top" style={{ paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Link href="/" className="back-btn" style={{ textDecoration: 'none', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <p className="eyebrow" style={{ margin: 0 }}>16th Muharram</p>
        </div>
        <h1 className="title" style={{ fontSize: '28px' }}>Doddaballapur Sabeel Info</h1>
        <p className="subtitle">Sabeels on the Bangalore to Doddaballapur route for 16th Muharram. This information helps Azadars locate refreshment points during the journey.</p>
        
        <div className="venue-search" style={{ marginTop: '20px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, location, or contact..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="venue-search-clear" onClick={() => setSearch('')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            )}
        </div>
      </header>

        {/* Emergency Quick Actions */}
        <div 
          style={{ 
            display: 'flex', gap: '12px', marginBottom: '24px', 
            overflowX: 'auto', paddingBottom: '4px', margin: '0 -20px', 
            paddingLeft: '20px', paddingRight: '20px',
            scrollbarWidth: 'none', msOverflowStyle: 'none'
          }} 
        >
          {/* Ambulance */}
          <a href="tel:9845824169" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: '0 0 160px', height: '80px', background: 'linear-gradient(145deg, rgba(156, 42, 55, 0.25), rgba(156, 42, 55, 0.05))', padding: '14px', borderRadius: '16px', border: '1px solid rgba(156, 42, 55, 0.3)', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 24 24" style={{ position: 'absolute', top: '-15px', right: '-10px', width: '85px', height: '85px', transform: 'rotate(15deg)' }}>
              <defs>
                <linearGradient id="redCrossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ff4d4d" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path fill="url(#redCrossGrad)" d="M19 10.5h-4.5V6a2 2 0 0 0-4 0v4.5H6a2 2 0 0 0 0 4h4.5V19a2 2 0 0 0 4 0v-4.5H19a2 2 0 0 0 0-4z" />
            </svg>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ color: '#e8b5bb', fontSize: '14.5px', fontWeight: 700, letterSpacing: '-0.01em' }}>Ambulance</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '1px' }}>Imran / Vaseem</div>
            </div>
          </a>

          {/* Medical Camp */}
          <a href="tel:9686334568" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: '0 0 160px', height: '80px', background: 'linear-gradient(145deg, rgba(156, 42, 55, 0.25), rgba(156, 42, 55, 0.05))', padding: '14px', borderRadius: '16px', border: '1px solid rgba(156, 42, 55, 0.3)', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 24 24" style={{ position: 'absolute', top: '-5px', right: '-15px', width: '90px', height: '90px', transform: 'rotate(-5deg)' }}>
              <defs>
                <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#ff4d4d" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path fill="none" stroke="url(#pulseGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M1 12h4l2.5-5.5 4.5 12.5 3.5-16 3.5 9h4" />
            </svg>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ color: '#e8b5bb', fontSize: '14.5px', fontWeight: 700, letterSpacing: '-0.01em' }}>Medical Camp</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '1px' }}>Navachethana Hosp.</div>
            </div>
          </a>

          {/* Police */}
          <a href="tel:112" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: '0 0 140px', height: '80px', background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 24 24" style={{ position: 'absolute', top: '-10px', right: '-15px', width: '85px', height: '85px', transform: 'rotate(15deg)' }}>
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path fill="url(#shieldGrad)" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ color: 'var(--text)', fontSize: '14.5px', fontWeight: 700, letterSpacing: '-0.01em' }}>Police / SOS</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '11px', marginTop: '1px' }}>Dial 112</div>
            </div>
          </a>
        </div>

        <div className="section-head">
          <span className="label">Route Progression (Bengaluru → Doddaballapur)</span>
          <span className="rule"></span>
        </div>

        <div className="sabeel-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {filtered.length === 0 ? (
             <div className="empty-state">No Sabeels found matching "{search}".</div>
          ) : (
            filtered.map((s, idx) => (
              <div key={idx} className="sabeel-card">
                <div className="sabeel-header">
                  <div className="sabeel-num">{s.sl_num}</div>
                  <h3 className="sabeel-name">{cleanStr(s.sabeel_name)}</h3>
                </div>
                <div className="sabeel-loc">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '3px' }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                   <span>{cleanStr(s.location)}</span>
                </div>
                
                <hr className="div" style={{ margin: '12px 0' }} />

                <div className="sabeel-contact-info">
                   <div className="sabeel-person">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                     <span>{cleanStr(s.contact_person)}</span>
                   </div>
                   <div className="sabeel-actions">
                     {String(s.contact_num || '').split(/[\n,]+/).flatMap(n => n.split('/')).map(num => num.trim()).filter(Boolean).map((num, i) => (
                       <div key={i} className="sabeel-phone-row">
                         <span className="sabeel-phone-num">{num}</span>
                         <div className="sabeel-phone-btns">
                           <button onClick={() => handleCopy(num)} className="btn-icon">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                           </button>
                           <a href={`tel:${num.replace(/\s+/g, '')}`} className="btn-icon primary">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                             Call
                           </a>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Architecture placeholder for future map support */}
                {/* 
                <div className="sabeel-map-actions">
                  <button className="btn-secondary">View on Map</button>
                  <button className="btn-secondary">Navigate</button>
                </div> 
                */}

              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
