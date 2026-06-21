'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Venue, Event, Day } from '@/types';
import {
  todayISO,
  findTodayDay,
  getStatus,
  getGregorianDateLabel,
  getFullGregorianDateLabel,
  getTodayGregorianLabel,
  isDateInPast
} from '../utils/dateHelpers';
import { EventCard } from './EventCard';
import { BottomSheet } from './BottomSheet';
import { VenueIcon } from './Icons';

interface ScheduleAppProps {
  venues: Venue[];
  events: Event[];
  days: Day[];
  config: {
    moharram1: string;
  };
}

export const ScheduleApp: React.FC<ScheduleAppProps> = ({ venues, events, days, config }) => {
  // Pre-index data for O(1) lookups
  const venuesById = useMemo(() => {
    const map: Record<string, Venue> = {};
    venues.forEach(v => {
      map[v.id] = v;
    });
    return map;
  }, [venues]);

  const daysByNum = useMemo(() => {
    const map: Record<number, Day> = {};
    days.forEach(d => {
      map[d.day] = d;
    });
    return map;
  }, [days]);

  // Determine current day of Moharram locked to IST
  const todayDayNum = useMemo(() => findTodayDay(days), [days]);

  // Main UI States
  const [tab, setTab] = useState<'home' | 'venues'>('home');
  const [selectedDay, setSelectedDay] = useState<number>(todayDayNum);
  const [zone, setZone] = useState<string>('All');
  const [pastExpanded, setPastExpanded] = useState<boolean>(false);
  
  // Sheet States
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventDayNum, setSelectedEventDayNum] = useState<number | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [sheetPastExpanded, setSheetPastExpanded] = useState<boolean>(false);

  // Tick state to trigger 30-second live status recalculation
  const [tick, setTick] = useState<number>(0);

  // Day rail reference for auto-scroll
  const dayRailRef = useRef<HTMLDivElement>(null);

  // Live status intervals (recalculates live badge count, event status pills)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll active day chip to center of rail
  useEffect(() => {
    if (tab === 'home' && dayRailRef.current) {
      const activeChip = dayRailRef.current.querySelector('.day-chip.active');
      if (activeChip) {
        activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDay, tab]);

  // Open Event detail sheet
  const openEventSheet = (eventId: string, dayNum: number) => {
    setSelectedEventId(eventId);
    setSelectedEventDayNum(dayNum);
    setSelectedVenueId(null); // Ensure venue detail sheet closes
    setSheetPastExpanded(false); // Reset sheet past expanded state
  };

  // Open Venue detail sheet
  const openVenueSheet = (venueId: string) => {
    setSelectedVenueId(venueId);
    setSelectedEventId(null); // Ensure event detail sheet closes
    setSheetPastExpanded(false); // Reset sheet past expanded state
  };

  const closeAllSheets = () => {
    setSelectedEventId(null);
    setSelectedEventDayNum(null);
    setSelectedVenueId(null);
    setSheetPastExpanded(false);
  };

  // Maps URL helper
  const getMapsLink = (v: Venue) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.maps_query + ', Bengaluru')}`;
  };

  // Filter & Sort Events for current selected day
  const filteredEventsForDay = useMemo(() => {
    // Filter events matching the selected day
    const dayEvents = events.filter(e => e.day_numbers && e.day_numbers.includes(selectedDay));
    
    // Calculate statuses and sort by time
    const sorted = [...dayEvents].sort((a, b) => {
      if (a.time_24h && b.time_24h) return a.time_24h.localeCompare(b.time_24h);
      if (a.time_24h) return -1;
      if (b.time_24h) return 1;
      return 0;
    });

    return sorted.map(e => ({
      event: e,
      status: getStatus(e, daysByNum[selectedDay])
    }));
  }, [selectedDay, events, daysByNum, tick]); // Depend on tick to re-run status checks

  // Categorize selected day events
  const { liveEvents, activeUpcomingEvents, pastEvents } = useMemo(() => {
    const live = filteredEventsForDay.filter(x => x.status === 'live');
    const active = filteredEventsForDay.filter(x => x.status !== 'live' && x.status !== 'past');
    const past = filteredEventsForDay.filter(x => x.status === 'past');
    return { liveEvents: live, activeUpcomingEvents: active, pastEvents: past };
  }, [filteredEventsForDay]);

  // Calculate live count specifically for TODAY in Bengaluru
  const liveCountToday = useMemo(() => {
    const todayDay = daysByNum[todayDayNum];
    if (!todayDay) return 0;
    const todayEvents = events.filter(e => e.day_numbers && e.day_numbers.includes(todayDayNum));
    return todayEvents.filter(e => getStatus(e, todayDay) === 'live').length;
  }, [events, todayDayNum, daysByNum, tick]);

  // Venues Tab Filter & Sorting
  const zones = useMemo(() => {
    return ['All', ...Array.from(new Set(venues.map(v => v.zone).filter(Boolean)))];
  }, [venues]);

  const venueEventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      counts[e.venue_id] = (counts[e.venue_id] || 0) + 1;
    });
    return counts;
  }, [events]);

  const filteredVenuesList = useMemo(() => {
    const filtered = zone === 'All' ? venues : venues.filter(v => v.zone === zone);
    return [...filtered].sort((a, b) => (venueEventCounts[b.id] || 0) - (venueEventCounts[a.id] || 0));
  }, [zone, venues, venueEventCounts]);

  // Retrieve current active sheet content objects
  const activeEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;
  const activeEventVenue = activeEvent ? venuesById[activeEvent.venue_id] : null;
  const activeEventDay = selectedEventDayNum !== null ? daysByNum[selectedEventDayNum] : null;
  
  const activeVenue = selectedVenueId ? venuesById[selectedVenueId] : null;

  // Render lists helper for other events in same venue
  const renderVenueMiniList = (venueId: string, excludeEventId: string) => {
    const otherEvs = events.filter(e => e.venue_id === venueId && e.id !== excludeEventId);
    if (!otherEvs.length) {
      return <div className="empty-state" style={{ padding: '18px' }}>No other majlis listed yet.</div>;
    }
    
    // Sort chronologically by day number, then time
    const sortedEvs = [...otherEvs].sort((a, b) => {
      const dayA = a.day_numbers[0] ?? 0;
      const dayB = b.day_numbers[0] ?? 0;
      if (dayA !== dayB) return dayA - dayB;
      if (a.time_24h && b.time_24h) return a.time_24h.localeCompare(b.time_24h);
      return 0;
    });

    const parsedEvs = sortedEvs.map(e => {
      const dNum = e.day_numbers[0];
      const status = getStatus(e, daysByNum[dNum]);
      return { event: e, status, dNum };
    });

    const activeUpcoming = parsedEvs.filter(x => x.status !== 'past');
    const past = parsedEvs.filter(x => x.status === 'past');

    const renderCard = (x: { event: Event; status: string; dNum: number }) => {
      const dayInfo = daysByNum[x.dNum] || { label: String(x.dNum), day: x.dNum };
      const cardCls = [
        'card',
        x.status === 'live' ? 'is-live' : '',
        x.status === 'past' ? 'is-past' : ''
      ].filter(Boolean).join(' ');

      const timeStr = x.event.time || '—';
      const parts = timeStr.trim().split(/\s+/);
      const timeVal = parts[0] || '—';
      const ampmVal = parts[1] || '';

      return (
        <div
          key={x.event.id}
          className={cardCls}
          style={{ marginBottom: '7px' }}
          onClick={() => openEventSheet(x.event.id, x.dNum)}
        >
          <div className="spine"></div>
          <div className="time-block">
            <div className="t">{timeVal}</div>
            <div className="ampm">{ampmVal}</div>
          </div>
          <div className="info">
            <div className="venue-name" style={{ fontSize: '13px' }}>
              {dayInfo.day === 0 ? 'Chand Raat' : `${dayInfo.label} Moharram`}
            </div>
            {x.event.minjanib && <div className="minjanib">{x.event.minjanib}</div>}
            {(x.status === 'live' || x.status === 'past') && (
              <div className="tags" style={{ marginTop: '5px' }}>
                {x.status === 'live' && <span className="tag live-tag">● Live now</span>}
                {x.status === 'past' && <span className="tag past-card-tag">✓ Completed</span>}
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {/* Active & Upcoming List */}
        {activeUpcoming.map(x => renderCard(x))}

        {activeUpcoming.length === 0 && past.length > 0 && (
          <div className="empty-state" style={{ padding: '10px 0 15px', fontSize: '13px' }}>
            All other majlises at this venue have concluded.
          </div>
        )}

        {/* Collapsible Past List */}
        {past.length > 0 && (
          <div className={`past-section ${sheetPastExpanded ? 'expanded' : ''}`} style={{ marginTop: '5px' }}>
            <button
              className="past-header"
              onClick={(e) => {
                e.stopPropagation();
                setSheetPastExpanded(!sheetPastExpanded);
              }}
              style={{ padding: '10px 12px' }}
            >
              <span className="label" style={{ fontSize: '13px' }}>Concluded Majlises</span>
              <span className="past-badge" style={{ fontSize: '11px' }}>{past.length} past</span>
              <span className="past-chevron">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className="past-content"
              style={{
                maxHeight: sheetPastExpanded ? 'none' : undefined,
                paddingTop: sheetPastExpanded ? '8px' : 0
              }}
            >
              {past.map(x => renderCard(x))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render list helper for full schedule at a venue
  const renderVenueFullSchedule = (venueId: string) => {
    const venueEvents = events.filter(e => e.venue_id === venueId);
    const sorted = [...venueEvents].sort((a, b) => {
      if (a.time_24h && b.time_24h) return a.time_24h.localeCompare(b.time_24h);
      if (a.time_24h) return -1;
      if (b.time_24h) return 1;
      return 0;
    });

    if (!sorted.length) {
      return <div className="empty-state" style={{ padding: '18px' }}>No majlis listed yet.</div>;
    }

    return sorted.map(e => {
      const dNum = e.day_numbers[0];
      const dayInfo = daysByNum[dNum] || { label: String(dNum), day: dNum };
      const status = getStatus(e, daysByNum[dNum]);
      const cardCls = [
        'card',
        status === 'live' ? 'is-live' : '',
        status === 'past' ? 'is-past' : ''
      ].filter(Boolean).join(' ');

      const timeStr = e.time || '—';
      const parts = timeStr.trim().split(/\s+/);
      const timeVal = parts[0] || '—';
      const ampmVal = parts[1] || '';

      return (
        <div
          key={e.id}
          className={cardCls}
          style={{ marginBottom: '7px' }}
          onClick={() => openEventSheet(e.id, dNum)}
        >
          <div className="spine"></div>
          <div className="time-block">
            <div className="t">{timeVal}</div>
            <div className="ampm">{ampmVal}</div>
          </div>
          <div className="info">
            <div className="venue-name" style={{ fontSize: '13px' }}>
              {dayInfo.day === 0 ? 'Chand Raat' : `${dayInfo.label} Moharram`}
              {e.location_detail && ` · ${e.location_detail.split(',')[0]}`}
            </div>
            {e.minjanib && <div className="minjanib">{e.minjanib}</div>}
            {(status === 'live' || status === 'past') && (
              <div className="tags" style={{ marginTop: '5px' }}>
                {status === 'live' && <span className="tag live-tag">● Live now</span>}
                {status === 'past' && <span className="tag past-card-tag">✓ Completed</span>}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  // Determine section titles
  const selectedDayObj = daysByNum[selectedDay];
  const dateBannerLabel = selectedDayObj ? getGregorianDateLabel(selectedDayObj.date_iso) : '';
  
  let activeSectionTitle = selectedDay === todayDayNum ? "Today's Majlis" : 'Upcoming Majlis';
  if (selectedDayObj && isDateInPast(selectedDayObj.date_iso)) {
    activeSectionTitle = 'Schedule';
  }

  let emptyStateMessage = 'No majlis recorded for this day yet.';
  if (pastEvents.length > 0 && selectedDayObj) {
    if (selectedDayObj.date_iso === todayISO()) {
      emptyStateMessage = 'All majlises for today have concluded.';
    } else if (isDateInPast(selectedDayObj.date_iso)) {
      emptyStateMessage = 'All majlises for this day have concluded.';
    }
  }

  const todayDayObj = daysByNum[todayDayNum];
  const todayTitle = todayDayObj 
    ? (todayDayObj.day === 0 ? 'Chand Raat' : `${todayDayObj.day} Moharram`)
    : '';

  return (
    <div className="app" id="app">
      {/* Page Header */}
      <header className="top">
        <p className="eyebrow">Anjuman-e-Imamia · Richmond Town</p>
        <h1 className="title">Majlis-e-Aza</h1>
        <p className="subtitle">Moharram-ul-Haraam 1448 AH · Bengaluru</p>
        <div className="today-row" suppressHydrationWarning>
          <div className="today-date" id="todayDate" suppressHydrationWarning>
            <b>{todayTitle}</b> · {getTodayGregorianLabel()}
          </div>
          <div className={`live-pill ${liveCountToday > 0 ? 'show' : ''}`} id="livePill" suppressHydrationWarning>
            <span className="dot-pulse"></span>
            <span id="liveCount" suppressHydrationWarning>{liveCountToday}</span> LIVE NOW
          </div>
        </div>
      </header>

      {/* Main Tab Views */}
      {tab === 'home' && (
        <>
          {/* Day Selection Rail */}
          <div className="day-rail" id="dayRail" ref={dayRailRef}>
            {days.map(d => {
              const chipClasses = [
                'day-chip',
                d.day === selectedDay ? 'active' : '',
                d.tag === 'Ashura' ? 'ashura' : '',
                d.day === todayDayNum ? 'today-marker' : ''
              ].filter(Boolean).join(' ');

              const label = d.day === 0 ? 'CR' : d.label;
              const subLabel = d.tag ? d.tag.split('-')[0] : d.weekday;

              return (
                <div
                  key={d.day}
                  className={chipClasses}
                  onClick={() => {
                    setSelectedDay(d.day);
                    setPastExpanded(false);
                  }}
                >
                  <div className="n">{label}</div>
                  <div className="wd">{subLabel}</div>
                </div>
              );
            })}
          </div>

          <main id="homeView">
            {/* Selected Day Banner */}
            <div className="day-banner" suppressHydrationWarning>
              {selectedDay === 0 ? 'Chand Raat' : `${selectedDay} Moharram`}{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-dim)', fontWeight: 400 }}>
                · {dateBannerLabel}
              </span>
              {selectedDayObj?.tag && (
                <span className="tag" style={{ marginLeft: '6px' }}>{selectedDayObj.tag}</span>
              )}
            </div>

            {/* Live Now Section */}
            {liveEvents.length > 0 && selectedDay === todayDayNum && (
              <div className="section">
                <div className="section-head live">
                  <span className="label">Live Now</span>
                  <span className="rule"></span>
                </div>
                {liveEvents.map(x => (
                  <EventCard
                    key={x.event.id}
                    event={x.event}
                    venue={venuesById[x.event.venue_id]}
                    status={x.status}
                    onClick={() => openEventSheet(x.event.id, selectedDay)}
                  />
                ))}
              </div>
            )}

            {/* Active / Upcoming / Schedule Section */}
            <div className="section">
              <div className="section-head">
                <span className="label">{activeSectionTitle}</span>
                <span className="rule"></span>
              </div>
              
              {activeUpcomingEvents.length > 0 ? (
                activeUpcomingEvents.map(x => (
                  <EventCard
                    key={x.event.id}
                    event={x.event}
                    venue={venuesById[x.event.venue_id]}
                    status={x.status}
                    onClick={() => openEventSheet(x.event.id, selectedDay)}
                  />
                ))
              ) : (
                <div className="empty-state">{emptyStateMessage}</div>
              )}
            </div>

            {/* Collapsible Past Majlises Section */}
            {pastEvents.length > 0 && (
              <div className={`past-section ${pastExpanded ? 'expanded' : ''}`}>
                <button className="past-header" onClick={() => setPastExpanded(!pastExpanded)}>
                  <span className="label">Past Majlises</span>
                  <span className="past-badge">{pastEvents.length} completed</span>
                  <span className="past-chevron">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div className="past-content" style={{ maxHeight: pastExpanded ? 'none' : undefined }}>
                  {pastEvents.map(x => (
                    <EventCard
                      key={x.event.id}
                      event={x.event}
                      venue={venuesById[x.event.venue_id]}
                      status={x.status}
                      onClick={() => openEventSheet(x.event.id, selectedDay)}
                    />
                  ))}
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {tab === 'venues' && (
        <main id="venuesView">
          {/* Zone Selector Chips */}
          <div className="zone-rail">
            {zones.map(z => (
              <div
                key={z}
                className={`zone-chip ${zone === z ? 'active' : ''}`}
                onClick={() => setZone(z)}
              >
                {z}
              </div>
            ))}
          </div>

          {/* Venues rows */}
          {filteredVenuesList.map(v => (
            <div key={v.id} className="venue-row" onClick={() => openVenueSheet(v.id)}>
              <div className="venue-icon">
                <VenueIcon type={v.type} size={18} />
              </div>
              <div className="info">
                <div className="vn">{v.name}</div>
                <div className="va">{v.area}</div>
                <div className="vc">{venueEventCounts[v.id] || 0} majlis this Moharram</div>
              </div>
              <div className="chev">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </div>
            </div>
          ))}
        </main>
      )}

      {/* Navigation Tab Bar */}
      <nav className="bottom">
        <button
          id="tabHomeBtn"
          className={tab === 'home' ? 'active' : ''}
          onClick={() => setTab('home')}
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11.5 12 4l9 7.5" />
            <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9" />
          </svg>
          Home
        </button>
        <button
          id="tabVenuesBtn"
          className={tab === 'venues' ? 'active' : ''}
          onClick={() => setTab('venues')}
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="2.6" />
          </svg>
          Venues
        </button>
      </nav>

      {/* Bottom Sheet Details Modal Container */}
      <BottomSheet isOpen={selectedEventId !== null || selectedVenueId !== null} onClose={closeAllSheets}>
        {/* Render Event Details Sheet */}
        {activeEvent && activeEventVenue && (
          <>
            <div className="sheet-banner">
              <div className="big-icon">
                <VenueIcon type={activeEventVenue.type} size={30} />
              </div>
              <div className="sheet-close" onClick={closeAllSheets}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </div>
              <div className="photo-tag">Photo coming soon</div>
            </div>
            
            <div className="sheet-body">
              <p className="sheet-eyebrow">
                {activeEventDay ? (
                  getStatus(activeEvent, activeEventDay) === 'live' 
                    ? '● Live Now' 
                    : (activeEventDay.day === 0 ? 'Chand Raat' : `${activeEventDay.day} Moharram`)
                ) : ''}
              </p>
              <h2>{activeEventVenue.name}</h2>
              <p className="loc">
                {activeEventVenue.area}
                {activeEvent.location_detail && ` · ${activeEvent.location_detail}`}
              </p>
              
              <div className="meta-grid">
                <div className="meta-box">
                  <div className="k">Date</div>
                  <div className="v">{activeEventDay ? getFullGregorianDateLabel(activeEventDay.date_iso) : ''}</div>
                </div>
                <div className="meta-box">
                  <div className="k">Time</div>
                  <div className="v">{activeEvent.time}</div>
                </div>
                {activeEvent.minjanib && (
                  <div className="meta-box meta-full">
                    <div className="k">Minjanib</div>
                    <div className="v">{activeEvent.minjanib}</div>
                  </div>
                )}
                {activeEvent.bayan_by && (
                  <div className="meta-box meta-full">
                    <div className="k">Bayan by</div>
                    <div className="v">{activeEvent.bayan_by}</div>
                  </div>
                )}
              </div>
              
              {activeEvent.notes && (
                <div className="notes-box">{activeEvent.notes}</div>
              )}
              
              <div className="cta-row">
                <a className="btn btn-primary" href={getMapsLink(activeEventVenue)} target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 11 18-7-7 18-2.5-7.5L3 11Z" />
                  </svg>
                  Get Directions
                </a>
                {activeEvent.youtube_url && (
                  <a className="btn btn-secondary" href={activeEvent.youtube_url} target="_blank" rel="noopener noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m10 8 5 4-5 4V8Z" />
                      <rect x="3" y="5" width="18" height="14" rx="3" />
                    </svg>
                    Watch Live
                  </a>
                )}
              </div>
              
              <hr className="div" />
              <p className="mini-label">Other majlis at this venue</p>
              {renderVenueMiniList(activeEventVenue.id, activeEvent.id)}
            </div>
          </>
        )}

        {/* Render Venue Details Sheet */}
        {activeVenue && (
          <>
            <div className="sheet-banner">
              <div className="big-icon">
                <VenueIcon type={activeVenue.type} size={30} />
              </div>
              <div className="sheet-close" onClick={closeAllSheets}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </div>
              <div className="photo-tag">Photo coming soon</div>
            </div>
            
            <div className="sheet-body">
              <p className="sheet-eyebrow">{activeVenue.zone}</p>
              <h2>{activeVenue.name}</h2>
              <p className="loc">{activeVenue.area}</p>
              
              <div className="cta-row">
                <a className="btn btn-primary" href={getMapsLink(activeVenue)} target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 11 18-7-7 18-2.5-7.5L3 11Z" />
                  </svg>
                  Get Directions
                </a>
              </div>
              
              <hr className="div" />
              <p className="mini-label">Full schedule this Moharram ({events.filter(e => e.venue_id === activeVenue.id).length})</p>
              {renderVenueFullSchedule(activeVenue.id)}
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
};
