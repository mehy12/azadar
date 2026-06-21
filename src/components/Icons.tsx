import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const MasjidIcon: React.FC<IconProps> = ({ size = 30, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 21V13a8 8 0 0 1 16 0v8" />
    <path d="M4 21h16" />
    <path d="M12 13V8" />
    <circle cx="12" cy="5.5" r="1.5" />
  </svg>
);

export const ImambaraIcon: React.FC<IconProps> = ({ size = 30, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 21V11a7 7 0 0 1 14 0v10" />
    <path d="M5 21h14" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

export const AzakhanaIcon: React.FC<IconProps> = ({ size = 30, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3c1.8 2 2.6 3.6 2.6 5.2A2.6 2.6 0 0 1 12 10.8a2.6 2.6 0 0 1-2.6-2.6C9.4 6.6 10.2 5 12 3Z" />
    <path d="M7 21c0-3.9 2.2-6 5-6s5 2.1 5 6" />
    <path d="M4 21h16" />
  </svg>
);

export const AshurkhanaIcon: React.FC<IconProps> = ({ size = 30, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3c1.8 2 2.6 3.6 2.6 5.2A2.6 2.6 0 0 1 12 10.8a2.6 2.6 0 0 1-2.6-2.6C9.4 6.6 10.2 5 12 3Z" />
    <path d="M7 21c0-3.9 2.2-6 5-6s5 2.1 5 6" />
    <path d="M4 21h16" />
  </svg>
);

export const PandalIcon: React.FC<IconProps> = ({ size = 30, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 4 3 20h18L12 4Z" />
    <path d="M12 4v16" />
  </svg>
);

export const QabrastanIcon: React.FC<IconProps> = ({ size = 30, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 21V10a5 5 0 0 1 10 0v11" />
    <path d="M4 21h16" />
    <path d="M12 7v4M10 9h4" />
  </svg>
);

export const ServiceIcon: React.FC<IconProps> = ({ size = 30, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z" />
  </svg>
);

export const ResidenceIcon: React.FC<IconProps> = ({ size = 30, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v10a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1V10" />
  </svg>
);

export const ProcessionRouteIcon: React.FC<IconProps> = ({ size = 30, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="6" cy="6" r="2.2" />
    <circle cx="18" cy="18" r="2.2" />
    <path d="M7.6 7.6c4 0 1 7 4 7s2.8-2.6 6.4-2.6" strokeDasharray="2.5 3" />
  </svg>
);

export const VenueIcon: React.FC<IconProps & { type: string }> = ({ type, size = 30, ...props }) => {
  switch (type) {
    case 'masjid': return <MasjidIcon size={size} {...props} />;
    case 'imambara': return <ImambaraIcon size={size} {...props} />;
    case 'azakhana': return <AzakhanaIcon size={size} {...props} />;
    case 'ashurkhana': return <AshurkhanaIcon size={size} {...props} />;
    case 'pandal': return <PandalIcon size={size} {...props} />;
    case 'qabrastan': return <QabrastanIcon size={size} {...props} />;
    case 'service': return <ServiceIcon size={size} {...props} />;
    case 'residence': return <ResidenceIcon size={size} {...props} />;
    case 'procession_route': return <ProcessionRouteIcon size={size} {...props} />;
    default: return <AzakhanaIcon size={size} {...props} />;
  }
};
