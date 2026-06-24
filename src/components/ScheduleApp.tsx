'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Venue, Event, Day } from '@/types';
import {
  todayISO,
  findTodayDay,
  getStatus,
  isDateInPast
} from '../utils/dateHelpers';
import { EventCard } from './EventCard';
import { BottomSheet } from './BottomSheet';
import { VenueIcon } from './Icons';
import { Locale, translate, toUrduNumbers, uiTranslations, translateDayTag } from '../utils/translations';

interface ScheduleAppProps {
  venues: Venue[];
  events: Event[];
  days: Day[];
  config: {
    moharram1: string;
  };
}

export const ScheduleApp: React.FC<ScheduleAppProps> = ({ venues, events, days, config }) => {
  const [tab, setTab] = useState<'home' | 'venues'>('home');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [zone, setZone] = useState<string>('All');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventDayNum, setSelectedEventDayNum] = useState<number | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [pastExpanded, setPastExpanded] = useState<boolean>(false);
  const [sheetPastExpanded, setSheetPastExpanded] = useState<boolean>(false);
  const [locale, setLocale] = useState<Locale>('en');
  const [venueSearch, setVenueSearch] = useState<string>('');

  const dayRailRef = useRef<HTMLDivElement>(null);

  // Filter out hidden venues for public display
  const visibleVenues = useMemo(() => {
    return venues.filter(v => !v.hidden);
  }, [venues]);

  // Mappings
  const venuesById = useMemo(() => {
    const map: Record<string, Venue> = {};
    visibleVenues.forEach(v => {
      map[v.id] = v;
    });
    return map;
  }, [visibleVenues]);

  const daysByNum = useMemo(() => {
    const map: Record<number, Day> = {};
    days.forEach(d => {
      map[d.day] = d;
    });
    return map;
  }, [days]);

  // Determine today's day number
  const todayDayNum = useMemo(() => {
    return findTodayDay(days);
  }, [days]);

  // Set initial selected day to today
  useEffect(() => {
    setSelectedDay(todayDayNum);
  }, [todayDayNum]);

  // Scroll active day chip into view
  useEffect(() => {
    if (tab === 'home' && dayRailRef.current) {
      setTimeout(() => {
        const rail = dayRailRef.current;
        const activeChip = rail?.querySelector('.day-chip.active') as HTMLElement;
        if (rail && activeChip) {
          const railWidth = rail.offsetWidth;
          const chipWidth = activeChip.offsetWidth;
          const chipLeft = activeChip.offsetLeft;
          rail.scrollTo({
            left: chipLeft - railWidth / 2 + chipWidth / 2,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [tab, selectedDay]);

  // Filter events for selected day
  const dayEvents = useMemo(() => {
    return events.filter(e => e.day_numbers.includes(selectedDay) && !!venuesById[e.venue_id]);
  }, [events, selectedDay, venuesById]);

  // Partition events into live, active, and past
  const partitionEvents = useMemo(() => {
    const selectedDayObj = daysByNum[selectedDay];
    
    // Sort events by time
    const sorted = [...dayEvents].sort((a, b) => {
      if (a.time_24h && b.time_24h) return a.time_24h.localeCompare(b.time_24h);
      if (a.time_24h) return -1;
      if (b.time_24h) return 1;
      return 0;
    });

    const liveList: { event: Event; status: 'past' | 'upcoming' | 'live' | 'plain' | 'flexible' }[] = [];
    const activeList: { event: Event; status: 'past' | 'upcoming' | 'live' | 'plain' | 'flexible' }[] = [];
    const pastList: { event: Event; status: 'past' | 'upcoming' | 'live' | 'plain' | 'flexible' }[] = [];

    sorted.forEach(e => {
      const status = getStatus(e, selectedDayObj);
      if (status === 'live') {
        liveList.push({ event: e, status });
      } else if (status === 'past') {
        pastList.push({ event: e, status });
      } else {
        activeList.push({ event: e, status });
      }
    });

    return {
      liveEvents: liveList,
      activeUpcomingEvents: activeList,
      pastEvents: pastList
    };
  }, [dayEvents, selectedDay, daysByNum]);

  const { liveEvents, activeUpcomingEvents, pastEvents } = partitionEvents;

  // Count live events for today
  const liveCountToday = useMemo(() => {
    const todayDayObj = daysByNum[todayDayNum];
    if (!todayDayObj) return 0;
    
    const todayEvents = events.filter(e => e.day_numbers.includes(todayDayNum) && !!venuesById[e.venue_id]);
    return todayEvents.filter(e => getStatus(e, todayDayObj) === 'live').length;
  }, [events, todayDayNum, daysByNum, venuesById]);

  // Unique zones
  const zones = useMemo(() => {
    const set = new Set<string>();
    visibleVenues.forEach(v => {
      if (v.zone) set.add(v.zone);
    });
    return ['All', ...Array.from(set).sort()];
  }, [visibleVenues]);

  const venueEventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      counts[e.venue_id] = (counts[e.venue_id] || 0) + 1;
    });
    return counts;
  }, [events]);

  const filteredVenuesList = useMemo(() => {
    let filtered = zone === 'All' ? visibleVenues : visibleVenues.filter(v => v.zone === zone);
    if (venueSearch.trim()) {
      const q = venueSearch.trim().toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.area.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => (venueEventCounts[b.id] || 0) - (venueEventCounts[a.id] || 0));
  }, [zone, visibleVenues, venueEventCounts, venueSearch]);

  // Retrieve current active sheet content objects
  const activeEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;
  const activeEventVenue = activeEvent ? venuesById[activeEvent.venue_id] : null;
  const activeEventDay = selectedEventDayNum !== null ? daysByNum[selectedEventDayNum] : null;
  
  const activeVenue = selectedVenueId ? venuesById[selectedVenueId] : null;

  // Render lists helper for other events in same venue
  const renderVenueMiniList = (venueId: string, excludeEventId: string) => {
    const otherEvs = events.filter(e => e.venue_id === venueId && e.id !== excludeEventId);
    if (!otherEvs.length) {
      return (
        <div className="empty-state" style={{ padding: '18px' }}>
          {locale === 'ur' ? 'ابھی کوئی دوسری مجلس درج نہیں ہے۔' : 'No other majlis listed yet.'}
        </div>
      );
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

      const dayDisplay = dayInfo.day === 0 
        ? uiTranslations[locale].chand_raat 
        : `${locale === 'ur' ? toUrduNumbers(dayInfo.label) : dayInfo.label} ${uiTranslations[locale].moharram_day}`;

      return (
        <div
          key={x.event.id}
          className={cardCls}
          style={{ marginBottom: '7px' }}
          onClick={() => openEventSheet(x.event.id, x.dNum)}
        >
          <div className="spine"></div>
          <div className="time-block">
            <div className="t">{translate(timeVal, locale)}</div>
            <div className="ampm">{translate(ampmVal, locale)}</div>
          </div>
          <div className="info">
            <div className="venue-name">
              {dayDisplay}
            </div>
            {x.event.minjanib && <div className="minjanib">{translate(x.event.minjanib, locale)}</div>}
            {(x.status === 'live' || x.status === 'past') && (
              <div className="tags" style={{ marginTop: '5px' }}>
                {x.status === 'live' && (
                  <span className="tag live-tag">
                    {locale === 'ur' ? '● ابھی لائیو' : '● Live now'}
                  </span>
                )}
                {x.status === 'past' && (
                  <span className="tag past-card-tag">
                    {locale === 'ur' ? '✓ مکمل' : '✓ Completed'}
                  </span>
                )}
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
          <div className="empty-state">
            {locale === 'ur' ? 'اس مقام پر دیگر تمام مجالس مکمل ہو چکی ہیں۔' : 'All other majlises at this venue have concluded.'}
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
              <span className="label">{uiTranslations[locale].concluded_majlises}</span>
              <span className="past-badge">
                {locale === 'ur' ? toUrduNumbers(past.length) : past.length} {uiTranslations[locale].past_badge}
              </span>
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
      return (
        <div className="empty-state" style={{ padding: '18px' }}>
          {locale === 'ur' ? 'ابھی کوئی مجلس درج نہیں ہے۔' : 'No majlis listed yet.'}
        </div>
      );
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

      const dayDisplay = dayInfo.day === 0 
        ? uiTranslations[locale].chand_raat 
        : `${locale === 'ur' ? toUrduNumbers(dayInfo.label) : dayInfo.label} ${uiTranslations[locale].moharram_day}`;

      return (
        <div
          key={e.id}
          className={cardCls}
          style={{ marginBottom: '7px' }}
          onClick={() => openEventSheet(e.id, dNum)}
        >
          <div className="spine"></div>
          <div className="time-block">
            <div className="t">{translate(timeVal, locale)}</div>
            <div className="ampm">{translate(ampmVal, locale)}</div>
          </div>
          <div className="info">
            <div className="venue-name">
              {dayDisplay}
              {e.location_detail && ` · ${translate(e.location_detail.split(',')[0], locale)}`}
            </div>
            {e.minjanib && <div className="minjanib">{translate(e.minjanib, locale)}</div>}
            {(status === 'live' || status === 'past') && (
              <div className="tags" style={{ marginTop: '5px' }}>
                {status === 'live' && (
                  <span className="tag live-tag">
                    {locale === 'ur' ? '● ابھی لائیو' : '● Live now'}
                  </span>
                )}
                {status === 'past' && (
                  <span className="tag past-card-tag">
                    {locale === 'ur' ? '✓ مکمل' : '✓ Completed'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  // Determine section titles
  const selectedDayObj = daysByNum[selectedDay];
  
  const dateBannerLabel = useMemo(() => {
    if (!selectedDayObj) return '';
    try {
      return new Date(selectedDayObj.date_iso + 'T00:00:00').toLocaleDateString(locale === 'ur' ? 'ur-IN' : 'en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch {
      return selectedDayObj.date_iso;
    }
  }, [selectedDayObj, locale]);
  
  let activeSectionTitle = selectedDay === todayDayNum 
    ? uiTranslations[locale].todays_majlis 
    : uiTranslations[locale].upcoming_majlis;
  if (selectedDayObj && isDateInPast(selectedDayObj.date_iso)) {
    activeSectionTitle = locale === 'ur' ? 'شیڈول' : 'Schedule';
  }

  const emptyStateMessage = useMemo(() => {
    let msg = uiTranslations[locale].no_majlis_day;
    if (pastEvents.length > 0 && selectedDayObj) {
      if (selectedDayObj.date_iso === todayISO()) {
        msg = uiTranslations[locale].all_concluded;
      } else if (isDateInPast(selectedDayObj.date_iso)) {
        msg = uiTranslations[locale].all_concluded_day;
      }
    }
    return msg;
  }, [pastEvents, selectedDayObj, locale]);

  const todayDayObj = daysByNum[todayDayNum];
  const todayTitle = todayDayObj 
    ? (todayDayObj.day === 0 ? uiTranslations[locale].chand_raat : `${locale === 'ur' ? toUrduNumbers(todayDayObj.day) : todayDayObj.day} ${uiTranslations[locale].moharram_day}`)
    : '';

  const todayGregorianLabel = useMemo(() => {
    try {
      return new Date().toLocaleDateString(locale === 'ur' ? 'ur-IN' : 'en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch {
      return '';
    }
  }, [locale]);

  const openEventSheet = (eventId: string, dayNum: number) => {
    setSelectedVenueId(null);
    setSelectedEventId(eventId);
    setSelectedEventDayNum(dayNum);
    setSheetPastExpanded(false);
  };

  const openVenueSheet = (venueId: string) => {
    setSelectedEventId(null);
    setSelectedEventDayNum(null);
    setSelectedVenueId(venueId);
    setSheetPastExpanded(false);
  };

  const closeAllSheets = () => {
    setSelectedEventId(null);
    setSelectedEventDayNum(null);
    setSelectedVenueId(null);
    setSheetPastExpanded(false);
  };

  const getMapsLink = (v: Venue) => {
    if (v.maps_query) {
      if (v.maps_query.trim().startsWith('http://') || v.maps_query.trim().startsWith('https://')) {
        return v.maps_query.trim();
      }
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.maps_query)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + ', ' + (v.area || 'Bengaluru'))}`;
  };

  return (
    <div className={`app ${locale === 'ur' ? 'rtl' : ''}`} id="app" dir={locale === 'ur' ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <header className="top">
        {/* Language Switcher Pill */}
        <div className="lang-switcher">
          <button 
            type="button"
            className={locale === 'en' ? 'active' : ''} 
            onClick={() => setLocale('en')}
          >
            EN
          </button>
          <button 
            type="button"
            className={locale === 'ur' ? 'active' : ''} 
            onClick={() => setLocale('ur')}
          >
            اردو
          </button>
        </div>

        <p className="eyebrow">{uiTranslations[locale].eyebrow}</p>
        <h1 className="title">{uiTranslations[locale].title}</h1>
        <p className="subtitle">{uiTranslations[locale].subtitle}</p>
        <div className="today-row" suppressHydrationWarning>
          <div className="today-date" id="todayDate" suppressHydrationWarning>
            <b>{todayTitle}</b> · {todayGregorianLabel}
          </div>
          <div className={`live-pill ${liveCountToday > 0 ? 'show' : ''}`} id="livePill" suppressHydrationWarning>
            <span className="dot-pulse"></span>
            <span id="liveCount" suppressHydrationWarning>{locale === 'ur' ? toUrduNumbers(liveCountToday) : liveCountToday}</span> {uiTranslations[locale].live_now}
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
                d.tag ? 'ashura' : '',
                d.date_iso === todayISO() ? 'today-marker' : ''
              ].filter(Boolean).join(' ');

              const label = d.day === 0 
                ? (locale === 'ur' ? 'چاند' : 'CR') 
                : (locale === 'ur' ? toUrduNumbers(d.day) : d.label);
              
              const subLabel = d.tag 
                ? translateDayTag(d.tag, locale) 
                : translate(d.weekday, locale);

              return (
                <div
                  key={d.day}
                  className={chipClasses}
                  onClick={() => setSelectedDay(d.day)}
                >
                  <div className="n">{label}</div>
                  <div className="wd">{subLabel}</div>
                </div>
              );
            })}
          </div>

          <main id="homeView">
            {/* Editorial Hero Section */}
            <div className="hero-section" suppressHydrationWarning>
              <div className="hero-day">
                {selectedDay === 0 ? (locale === 'ur' ? 'چاند' : 'CR') : (locale === 'ur' ? toUrduNumbers(selectedDay) : selectedDay)}
              </div>
              <div className="hero-content">
                <div className="hero-month">
                  {selectedDay === 0 ? uiTranslations[locale].chand_raat : uiTranslations[locale].moharram_day}
                </div>
                <div className="hero-meta">
                  {dateBannerLabel}
                  {selectedDayObj?.tag && (
                    <span className="hero-tag">{translateDayTag(selectedDayObj.tag, locale)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Now Section */}
            {liveEvents.length > 0 && selectedDay === todayDayNum && (
              <div className="section">
                <div className="section-head live">
                  <span className="label">{uiTranslations[locale].live_now}</span>
                  <span className="rule"></span>
                </div>
                {liveEvents.map(x => (
                  <EventCard
                    key={x.event.id}
                    event={x.event}
                    venue={venuesById[x.event.venue_id]}
                    status={x.status}
                    onClick={() => openEventSheet(x.event.id, selectedDay)}
                    locale={locale}
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
                    locale={locale}
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
                  <span className="label">{uiTranslations[locale].past_majlises}</span>
                  <span className="past-badge">
                    {locale === 'ur' ? toUrduNumbers(pastEvents.length) : pastEvents.length} {uiTranslations[locale].past_count}
                  </span>
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
                      locale={locale}
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
                {translate(z, locale)}
              </div>
            ))}
          </div>

          {/* Venue Search Bar */}
          <div className="venue-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder={locale === 'ur' ? 'مقام تلاش کریں...' : 'Search venues...'}
              value={venueSearch}
              onChange={e => setVenueSearch(e.target.value)}
            />
            {venueSearch && (
              <button className="venue-search-clear" onClick={() => setVenueSearch('')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            )}
          </div>

          {/* Venues rows */}
          {(() => {
            const grouped = filteredVenuesList.reduce((acc, v) => {
              const groupKey = zone === 'All Bangalore' ? v.zone : v.area;
              if (!acc[groupKey]) acc[groupKey] = [];
              acc[groupKey].push(v);
              return acc;
            }, {} as Record<string, Venue[]>);

            return Object.entries(grouped).map(([groupName, groupVenues]) => (
              <div key={groupName} className="venue-group" style={{ marginBottom: '24px' }}>
                <h3 className="venue-group-title" style={{ fontSize: 'var(--text-caption)', fontWeight: 'var(--weight-title)', color: 'var(--text-faint)', paddingBottom: '8px', borderBottom: '1px solid var(--line)', marginBottom: '4px' }}>
                  {translate(groupName, locale)}
                </h3>
                {groupVenues.map(v => (
                  <div key={v.id} className="venue-row" onClick={() => openVenueSheet(v.id)}>
                    <div className="venue-icon">
                      <VenueIcon type={v.type} size={18} />
                    </div>
                    <div className="info">
                      <div className="vn">{translate(v.name, locale)}</div>
                      <div className="va">{translate(v.area, locale)}</div>
                      <div className="vc">
                        {locale === 'ur' 
                          ? `${toUrduNumbers(venueEventCounts[v.id] || 0)} مجالس اس محرم` 
                          : `${venueEventCounts[v.id] || 0} majlis this Moharram`}
                      </div>
                    </div>
                    <div className="chev">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ));
          })()}
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
          {uiTranslations[locale].home}
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
          {uiTranslations[locale].venues}
        </button>
      </nav>

      {/* Bottom Sheet Details Modal Container */}
      <BottomSheet isOpen={selectedEventId !== null || selectedVenueId !== null} onClose={closeAllSheets}>
        {/* Render Event Details Sheet */}
        {activeEvent && activeEventVenue && (
          <>
            <div className="sheet-banner" style={activeEventVenue.photo_url ? { backgroundImage: `url(${activeEventVenue.photo_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
              {!activeEventVenue.photo_url && (
                <div className="big-icon">
                  <VenueIcon type={activeEventVenue.type} size={30} />
                </div>
              )}
              <div className="sheet-close" onClick={closeAllSheets}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </div>
              {!activeEventVenue.photo_url && (
                <div className="photo-tag">{uiTranslations[locale].photo_soon}</div>
              )}
            </div>
            
            <div className="sheet-body">
              <p className="sheet-eyebrow">
                {activeEventDay ? (
                  getStatus(activeEvent, activeEventDay) === 'live' 
                    ? `● ${uiTranslations[locale].live_now}` 
                    : (activeEventDay.day === 0 
                        ? uiTranslations[locale].chand_raat 
                        : `${locale === 'ur' ? toUrduNumbers(activeEventDay.day) : activeEventDay.day} ${uiTranslations[locale].moharram_day}`)
                ) : ''}
              </p>
              <h2>{translate(activeEventVenue.name, locale)}</h2>
              <p className="loc">
                {translate(activeEventVenue.area, locale)}
                {activeEvent.location_detail && ` · ${translate(activeEvent.location_detail, locale)}`}
              </p>
              
              <div className="meta-grid">
                <div className="meta-box">
                  <div className="k">{uiTranslations[locale].date}</div>
                  <div className="v">
                    {activeEventDay 
                      ? new Date(activeEventDay.date_iso + 'T00:00:00').toLocaleDateString(locale === 'ur' ? 'ur-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) 
                      : ''}
                  </div>
                </div>
                <div className="meta-box">
                  <div className="k">{uiTranslations[locale].time}</div>
                  <div className="v">{translate(activeEvent.time, locale)}</div>
                </div>
                {activeEvent.minjanib && (
                  <div className="meta-box meta-full organizer">
                    <div className="k">{uiTranslations[locale].minjanib}</div>
                    <div className="v">{translate(activeEvent.minjanib, locale)}</div>
                  </div>
                )}
                {activeEvent.bayan_by && (
                  <div className="meta-box meta-full speaker">
                    <div className="k">{uiTranslations[locale].bayan_by}</div>
                    <div className="v">{translate(activeEvent.bayan_by, locale)}</div>
                  </div>
                )}
              </div>
              
              {activeEvent.notes && (
                <div className="notes-box">{translate(activeEvent.notes, locale)}</div>
              )}
              
              <div className="cta-row">
                <a className="btn btn-primary" href={getMapsLink(activeEventVenue)} target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 11 18-7-7 18-2.5-7.5L3 11Z" />
                  </svg>
                  {uiTranslations[locale].get_directions}
                </a>
                {activeEvent.youtube_url && (
                  <a className="btn btn-secondary" href={activeEvent.youtube_url} target="_blank" rel="noopener noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m10 8 5 4-5 4V8Z" />
                      <rect x="3" y="5" width="18" height="14" rx="3" />
                    </svg>
                    {uiTranslations[locale].watch_live}
                  </a>
                )}
              </div>
              
              <hr className="div" />
              <p className="mini-label">{uiTranslations[locale].other_majlis}</p>
              {renderVenueMiniList(activeEventVenue.id, activeEvent.id)}
            </div>
          </>
        )}

        {/* Render Venue Details Sheet */}
        {activeVenue && (
          <>
            <div className="sheet-banner" style={activeVenue.photo_url ? { backgroundImage: `url(${activeVenue.photo_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
              {!activeVenue.photo_url && (
                <div className="big-icon">
                  <VenueIcon type={activeVenue.type} size={30} />
                </div>
              )}
              <div className="sheet-close" onClick={closeAllSheets}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </div>
              {!activeVenue.photo_url && (
                <div className="photo-tag">{uiTranslations[locale].photo_soon}</div>
              )}
            </div>
            
            <div className="sheet-body">
              <p className="sheet-eyebrow">{translate(activeVenue.zone, locale)}</p>
              <h2>{translate(activeVenue.name, locale)}</h2>
              <p className="loc">{translate(activeVenue.area, locale)}</p>
              
              <div className="cta-row">
                <a className="btn btn-primary" href={getMapsLink(activeVenue)} target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 11 18-7-7 18-2.5-7.5L3 11Z" />
                  </svg>
                  {uiTranslations[locale].get_directions}
                </a>
              </div>
              
              <hr className="div" />
              <p className="mini-label">
                {locale === 'ur'
                  ? `${uiTranslations[locale].full_schedule} (${toUrduNumbers(events.filter(e => e.venue_id === activeVenue.id).length)})`
                  : `${uiTranslations[locale].full_schedule} (${events.filter(e => e.venue_id === activeVenue.id).length})`}
              </p>
              {renderVenueFullSchedule(activeVenue.id)}
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
};
