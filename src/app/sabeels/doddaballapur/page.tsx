import Link from 'next/link';

export const metadata = {
  title: "Doddaballapur Sabeel Info",
  description: "Sabeels on the Bangalore to Doddaballapur route for 16th Muharram."
};

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--header-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Link href="/" style={{
          textDecoration: 'none',
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          background: 'var(--surface)',
          borderRadius: '0px',
          border: '1px solid var(--line)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '20px', margin: 0 }}>Doddaballapur Route</h1>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          padding: '40px 24px',
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(212, 175, 55, 0.1)',
            color: 'var(--gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', margin: '0 0 12px 0' }}>Under Maintenance</h2>
          
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Due to huge amounts of traffic and to deploy our new live navigation features, the Doddaballapur Sabeel directory is temporarily offline.
          </p>
          
          <div style={{
            background: 'var(--maroon-soft)',
            border: '1px solid var(--maroon-line)',
            color: 'var(--maroon-text)',
            padding: '16px',
            fontSize: '14px',
            lineHeight: 1.5,
            textAlign: 'left'
          }}>
            <strong>Please wait:</strong> Azadars are requested to wait patiently. A push notification will be sent to all registered devices the moment the new route map is live.
          </div>
          
          <Link href="/" style={{
            display: 'block',
            width: '100%',
            padding: '16px',
            background: 'var(--text)',
            color: 'var(--bg)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '15px',
            marginTop: '32px',
            transition: 'opacity 0.2s'
          }}>
            Return Home
          </Link>
        </div>
      </main>
    </div>
  );
}
