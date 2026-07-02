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
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  // Get User's Location
  useEffect(() => {
    // Developer Override via Console
    (window as any).setMockLocation = (lat: number, lng: number) => {
      setUserLocation({ lat, lng });
      console.log(`%c[AzaHub Debug]%c Mock location updated to: ${lat}, ${lng}`, 'color: #D4AF37; font-weight: bold;', 'color: inherit;');
    };

    // Developer Override for testing specific coordinates via URL
    const urlParams = new URLSearchParams(window.location.search);
    const testLat = urlParams.get('testLat');
    const testLng = urlParams.get('testLng');

    if (testLat && testLng) {
      setUserLocation({
        lat: parseFloat(testLat),
        lng: parseFloat(testLng)
      });
      return;
    }

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
    
    return () => {
      delete (window as any).setMockLocation;
    };
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

  // Next and Upcoming Sabeels (only if location is available and no filters applied)
  const { nextSabeel, upcomingSabeels } = useMemo(() => {
    if (!userLocation || search || selectedFilters.length > 0) {
      return { nextSabeel: null, upcomingSabeels: [] };
    }
    const sortedByDistance = [...sabeelsWithDistance].sort((a, b) => a.distance - b.distance);
    const closest = sortedByDistance[0];
    if (!closest) return { nextSabeel: null, upcomingSabeels: [] };

    let actualNext = closest;
    const sortedByRoute = [...sabeelsWithDistance].sort((a, b) => a.sl_num - b.sl_num);
    const closestIdx = sortedByRoute.findIndex(s => s.id === closest.id);

    if (closestIdx !== -1 && closestIdx < sortedByRoute.length - 1) {
      // Find the next Sabeel that actually has coordinates
      const nextWithCoords = sortedByRoute.slice(closestIdx + 1).find(s => s.lat && s.lng);
      
      if (nextWithCoords && typeof closest.lat === 'number' && typeof closest.lng === 'number' && typeof nextWithCoords.lat === 'number' && typeof nextWithCoords.lng === 'number') {
        const distUserToNext = nextWithCoords.distance;
        const distClosestToNext = getDistanceFromLatLonInKm(closest.lat, closest.lng, nextWithCoords.lat, nextWithCoords.lng);
        
        // Geometric check: If the user is closer to the upcoming waypoint than the current waypoint is to the upcoming waypoint,
        // it means the user has driven past the current waypoint!
        if (distUserToNext < distClosestToNext) {
          actualNext = sortedByRoute[closestIdx + 1]; // Advance to the next one in the route
        }
      }
    }
    
    // Upcoming are strictly those after actualNext in route order
    const upcoming = sortedByRoute.filter(s => s.sl_num > actualNext.sl_num);
      
    return { nextSabeel: actualNext, upcomingSabeels: upcoming };
  }, [sabeelsWithDistance, userLocation, search, selectedFilters]);

  const formatETA = (distKm: number) => {
    if (distKm === Infinity) return '';
    const mins = Math.max(1, Math.round((distKm * 60) / 5)); // 5km/h walk for all
    if (mins < 60) return `${mins} mins walk`;
    
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hrs} hr${hrs > 1 ? 's' : ''} ${m > 0 ? `${m} mins ` : ''}walk`;
  };

  const getFilterIcon = (f: string) => {
    const fw = f.toLowerCase();
    if (fw.includes('water')) return <span style={{color: '#60a5fa'}}>💧</span>;
    if (fw.includes('tea') || fw.includes('chai')) return <span style={{color: '#fbbf24'}}>☕</span>;
    if (fw.includes('food') || fw.includes('tabarruk') || fw.includes('biryani')) return <span style={{color: '#f87171'}}>🍛</span>;
    if (fw.includes('rest') || fw.includes('washroom') || fw.includes('toilet')) return <span style={{color: '#a78bfa'}}>🛏️</span>;
    if (fw.includes('ors') || fw.includes('medical')) return <span style={{color: '#f97316'}}>✚</span>;
    return null;
  };

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
        
        {nextSabeel ? (
          <>
            {/* NEXT SABEEL FEATURED CARD */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 12px 0', color: 'var(--text)' }}>Next Sabeel</h2>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '0', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '64px', height: '64px', flexShrink: 0, borderRadius: '0', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--gold)', fontSize: '24px', fontWeight: 700 }}>
                    {nextSabeel.sl_num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text)' }}>
                      {cleanStr(nextSabeel.sabeel_name)}
                    </h3>
                    <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                      {nextSabeel.distance < 1 ? `${(nextSabeel.distance * 1000).toFixed(0)} m` : `${nextSabeel.distance.toFixed(1)} km`} away
                    </div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '12px' }}>
                      ETA: {formatETA(nextSabeel.distance)}
                    </div>
                    {/* Tags */}
                    {nextSabeel.filters && nextSabeel.filters.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {nextSabeel.filters.map((f, i) => (
                          <span key={i} style={{ background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text-dim)', fontSize: '11px', padding: '4px 8px', borderRadius: '0', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            {getFilterIcon(f)} {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => openMap(nextSabeel)}
                  style={{ width: '100%', padding: '12px', background: 'var(--gold)', color: '#000', borderRadius: '0', border: 'none', fontWeight: 700, marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                  Directions
                </button>
              </div>
            </div>

            {/* UPCOMING SABEELS TIMELINE */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>Upcoming Sabeels</h2>
                <span style={{ color: 'var(--gold)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSearch(' ')}>View all</span>
              </div>
              
              <div className="sabeel-timeline" style={{ position: 'relative', paddingLeft: '8px' }}>
                <div style={{ position: 'absolute', left: '23px', top: '24px', bottom: '24px', width: '2px', borderLeft: '2px dashed var(--gold-line)' }}></div>
                
                {(showAllUpcoming ? upcomingSabeels : upcomingSabeels.slice(0, 5)).map((s, idx) => (
                  <div key={s.id || idx} style={{ display: 'flex', gap: '16px', marginBottom: '24px', position: 'relative', cursor: 'pointer' }} onClick={() => openMap(s)}>
                    <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '0', background: 'var(--bg)', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: '13px', fontWeight: 700, zIndex: 2, marginTop: '0px' }}>
                      {s.sl_num}
                    </div>
                    <div style={{ flex: 1, paddingBottom: '20px', borderBottom: idx === upcomingSabeels.length - 1 ? 'none' : '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text)', paddingRight: '12px' }}>
                          {cleanStr(s.sabeel_name)}
                        </h3>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                      
                      {s.distance !== Infinity && (
                        <div style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginBottom: '12px' }}>
                          {s.distance < 1 ? `${(s.distance * 1000).toFixed(0)} m` : `${s.distance.toFixed(1)} km`} away &nbsp;•&nbsp; ETA: {formatETA(s.distance)}
                        </div>
                      )}

                      {/* Tags */}
                      {s.filters && s.filters.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {s.filters.map((f, i) => (
                            <span key={i} style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-dim)', fontSize: '11.5px', padding: '4px 8px', borderRadius: '0', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                              {getFilterIcon(f)} {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {!showAllUpcoming && upcomingSabeels.length > 5 && (
                  <button 
                    onClick={() => setShowAllUpcoming(true)}
                    style={{ width: '100%', padding: '12px', background: 'transparent', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '0', fontWeight: 600, marginTop: '8px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Show More ({upcomingSabeels.length - 5})
                  </button>
                )}

                {upcomingSabeels.length === 0 && (
                  <div style={{ color: 'var(--text-dim)', paddingLeft: '40px', fontStyle: 'italic', fontSize: '14px' }}>
                    You have passed all registered sabeels.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* STANDARD SEARCH / ALL VIEW */}
            <div className="section-head" style={{ marginBottom: '8px' }}>
              <span className="label" style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>
                {search || selectedFilters.length > 0 ? 'Search Results' : 'All Sabeels'} <span style={{ color: 'var(--gold)', fontWeight: 600 }}>(Bengaluru → Doddaballapur)</span>
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
          </>
        )}
        
      </main>
    </div>
  );
}
