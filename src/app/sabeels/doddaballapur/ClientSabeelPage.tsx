'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

export interface Sabeel {
  id?: string;
  sl_num: number;
  sabeel_name: string;
  location: string;
  contact_person: string;
  contact_num: string;
  maps_link?: string;
  lat?: number;
  lng?: number;
  filters?: string[];
}

// Haversine formula to calculate distance in KM
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export default function ClientSabeelPage({ sabeels }: { sabeels: Sabeel[] }) {
  const [search, setSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get User's Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Compute all available unique filters across all sabeels
  const allFilters = useMemo(() => {
    const filtersSet = new Set<string>();
    sabeels.forEach(s => {
      if (s.filters && Array.isArray(s.filters)) {
        s.filters.forEach(f => filtersSet.add(f.trim()));
      }
    });
    return Array.from(filtersSet).sort();
  }, [sabeels]);

  // Compute distances for all sabeels that have lat/lng
  const sabeelsWithDistance = useMemo(() => {
    return sabeels.map(s => {
      let dist = Infinity;
      if (userLocation && s.lat && s.lng) {
        dist = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, s.lat, s.lng);
      }
      return { ...s, distance: dist };
    });
  }, [sabeels, userLocation]);

  // Sabeels Nearby (top 3 closest, under 50km)
  const nearbySabeels = useMemo(() => {
    if (!userLocation) return [];
    return [...sabeelsWithDistance]
      .filter(s => s.distance < 50)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [sabeelsWithDistance, userLocation]);

  // Filtered List for main view
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return sabeelsWithDistance.filter(s => {
      // Text search
      const matchesSearch = !q || 
        s.sabeel_name?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.contact_person?.toLowerCase().includes(q) ||
        s.contact_num?.toString().toLowerCase().includes(q);
        
      // Tags/Filters
      const matchesFilters = selectedFilters.length === 0 || 
        selectedFilters.every(f => s.filters?.includes(f));

      return matchesSearch && matchesFilters;
    });
  }, [search, selectedFilters, sabeelsWithDistance]);

  const toggleFilter = (f: string) => {
    setSelectedFilters(prev => 
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  const cleanStr = (s: string | number | undefined | null) => {
    if (s === null || s === undefined) return '';
    return String(s).split('\n').join(' ').replace(new RegExp('\\s\\s+', 'g'), ' ').trim();
  };

  const openMap = (s: Sabeel) => {
    if (s.maps_link) {
      window.open(s.maps_link, '_blank');
    } else if (s.lat && s.lng) {
      window.open(`https://maps.google.com/?q=${s.lat},${s.lng}`, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(cleanStr(s.location))}`, '_blank');
    }
  };

  const renderSabeelCard = (s: Sabeel & { distance: number }, idx: number, isNearby: boolean = false) => (
    <div key={s.id || idx} style={{ display: 'flex', gap: '16px', marginBottom: '16px', position: 'relative' }}>
      
      {!isNearby && (
        <div style={{ flexShrink: 0, width: '30px', height: '30px', borderRadius: '0', background: 'var(--background)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: '13px', fontWeight: 700, zIndex: 2, marginTop: '24px' }}>
          {s.sl_num}
        </div>
      )}

      <div className="sabeel-card" style={{ flex: 1, margin: 0, padding: '20px', borderRadius: '0', background: 'var(--surface)', border: isNearby ? '1px solid var(--gold)' : '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <h3 className="sabeel-name" style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.4, color: 'var(--text)' }}>
            {cleanStr(s.sabeel_name)}
          </h3>
          {s.distance !== Infinity && (
            <div style={{ flexShrink: 0, background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)', padding: '4px 8px', borderRadius: '0', fontSize: '11px', fontWeight: 700 }}>
              {s.distance < 1 ? `${(s.distance * 1000).toFixed(0)}m` : `${s.distance.toFixed(1)}km`} away
            </div>
          )}
        </div>
        
        {/* Filters / Tags */}
        {s.filters && s.filters.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {s.filters.map((f, i) => (
              <span key={i} style={{ background: 'var(--background)', border: '1px solid var(--line)', color: 'var(--text-dim)', fontSize: '11px', padding: '4px 8px', borderRadius: '0', fontWeight: 600 }}>
                {f}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-dim)', fontSize: '13.5px', lineHeight: 1.4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              <span>{cleanStr(s.location)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dim)', fontSize: '13.5px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            <span>{cleanStr(s.contact_person)}</span>
          </div>
          
          <div style={{ height: '1px', background: 'var(--line)', margin: '4px 0' }} />

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {String(s.contact_num || '').split(new RegExp('[\\n,]+')).flatMap(n => n.split('/')).map(num => num.trim()).filter(Boolean).map((num, i) => (
                <a key={i} href={`tel:${num.split(' ').join('')}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  {num}
                </a>
              ))}
            </div>
            
            <button 
              onClick={() => openMap(s)} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', height: '38px', borderRadius: '0', background: 'var(--gold)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app sabeel-app">
      <header className="top" style={{ paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Link href="/" className="back-btn" style={{ textDecoration: 'none', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '0', background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </Link>
          <p className="eyebrow" style={{ margin: 0 }}>16th Muharram</p>
        </div>
        <h1 className="title" style={{ fontSize: '28px' }}>Doddaballapur Route</h1>
        <p className="subtitle">Sabeels and facilities on the Bangalore to Doddaballapur route. Grant location access to find nearby Sabeels.</p>

        {/* Filters */}
        <div style={{ marginTop: '20px' }}>
          <div className="venue-search" style={{ margin: 0, width: '100%' }}>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            )}
          </div>
          
          {allFilters.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '16px 0 4px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {allFilters.map(f => {
                const isSelected = selectedFilters.includes(f);
                return (
                  <button 
                    key={f}
                    onClick={() => toggleFilter(f)}
                    style={{ flexShrink: 0, padding: '6px 14px', borderRadius: '0', border: isSelected ? '1px solid var(--gold)' : '1px solid var(--line)', background: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'var(--surface)', color: isSelected ? 'var(--gold)' : 'var(--text-dim)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </header>

      <main style={{ padding: '0 20px 40px 20px' }}>
        
        {/* Nearby Sabeels Section */}
        {nearbySabeels.length > 0 && !search && selectedFilters.length === 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div className="section-head" style={{ marginBottom: '16px' }}>
              <span className="label" style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>
                📍 Sabeels Nearby
              </span>
            </div>
            <div>
              {nearbySabeels.map((s, idx) => renderSabeelCard(s, idx, true))}
            </div>
          </div>
        )}

        <div className="section-head" style={{ marginBottom: '8px' }}>
          <span className="label" style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>
            All Sabeels <span style={{ color: 'var(--gold)', fontWeight: 600 }}>(Bengaluru → Doddaballapur)</span>
          </span>
        </div>

        <div className="sabeel-timeline" style={{ position: 'relative', marginTop: '24px' }}>
          <div style={{ position: 'absolute', left: '15px', top: '14px', bottom: '14px', width: '1px', background: 'rgba(212, 175, 55, 0.3)' }}></div>

          {filtered.length === 0 ? (
            <div className="empty-state" style={{ paddingLeft: '40px' }}>No Sabeels found matching your criteria.</div>
          ) : (
            filtered.map((s, idx) => renderSabeelCard(s, idx, false))
          )}
        </div>
      </main>
    </div>
  );
}
