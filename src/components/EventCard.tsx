import React from 'react';
import { Event, Venue } from '@/types';
import { translate, Locale } from '../utils/translations';
import { generateGoogleCalendarLink } from '../utils/calendarHelpers';

interface EventCardProps {
  event: Event;
  venue: Venue;
  status: 'past' | 'upcoming' | 'live' | 'plain' | 'flexible';
  onClick: () => void;
  locale?: Locale;
}

export const EventCard: React.FC<EventCardProps> = ({ event, venue, status, onClick, locale = 'en' }) => {
  if (!venue) return null;

  const calendarUrl = generateGoogleCalendarLink(event, venue);
  const isAshuraCard = (event.date_label && event.date_label.toLowerCase().includes('ashoor')) || venue.id === 'shia-qabrastan';
  
  const cardClasses = [
    'card',
    status === 'live' ? 'is-live' : '',
    status === 'past' ? 'is-past' : '',
    isAshuraCard ? 'ashura-card' : ''
  ].filter(Boolean).join(' ');

  // Extract time parts
  const timeStr = event.time || '—';
  const parts = timeStr.trim().split(/\s+/);
  const timeVal = parts[0] || '—';
  const ampmVal = parts[1] || '';

  // Extract tags matching the prototype's logic
  const tags: string[] = [];
  if (event.notes) {
    tags.push(event.notes.split(';')[0].slice(0, 42));
  }
  if (event.location_detail) {
    tags.push(event.location_detail.split(',')[0]);
  }

  const renderedMinjanib = event.minjanib ? (
    locale === 'ur' 
      ? `منجانب: ${translate(event.minjanib, locale)}` 
      : `Minjanib: ${event.minjanib}`
  ) : null;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="time-block">
        <span className="t">{translate(timeVal, locale)}</span>
        <span className="ampm">{translate(ampmVal, locale)}</span>
      </div>
      <div className="spine">
        <div className="spine-dot"></div>
        <div className="spine-line"></div>
      </div>
      <div className="info">
        <div className="venue-name">{translate(venue.name, locale)}</div>
        {renderedMinjanib && <div className="minjanib">{renderedMinjanib}</div>}
        {(tags.length > 0 || status === 'live' || status === 'past') && (
          <div className="tags">
            {tags.map((tag, idx) => (
              <span key={idx} className="tag">{translate(tag, locale)}</span>
            ))}
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
        {calendarUrl && status !== 'past' && (
          <a 
            href={calendarUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="calendar-btn"
            onClick={(e) => e.stopPropagation()}
          >
            📅 {locale === 'ur' ? 'کیلنڈر میں شامل کریں' : 'Add to Calendar'}
          </a>
        )}
      </div>
      <div className="chev">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </div>
    </div>
  );
};
