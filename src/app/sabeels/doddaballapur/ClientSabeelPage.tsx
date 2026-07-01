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

      <main style={{ padding: '24px 20px' }}>
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
                     {String(s.contact_num || '').split(/[\/\n,]+/).map(num => num.trim()).filter(Boolean).map((num, i) => (
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
