import React from 'react';
import { Event, Venue } from '@/types';

interface EventCardProps {
  event: Event;
  venue: Venue;
  status: 'past' | 'upcoming' | 'live' | 'plain' | 'flexible';
  onClick: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, venue, status, onClick }) => {
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

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="spine"></div>
      <div className="time-block">
        <div className="t">{timeVal}</div>
        <div className="ampm">{ampmVal}</div>
      </div>
      <div className="info">
        <div className="venue-name">{venue.name}</div>
        {event.minjanib && <div className="minjanib">Minjanib: {event.minjanib}</div>}
        {(tags.length > 0 || status === 'live' || status === 'past') && (
          <div className="tags">
            {tags.map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
            {status === 'live' && <span className="tag live-tag">● Live now</span>}
            {status === 'past' && <span className="tag past-card-tag">✓ Completed</span>}
          </div>
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
