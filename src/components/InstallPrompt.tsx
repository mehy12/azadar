'use client';

import React, { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone || 
                             document.referrer.includes('android-app://');
                             
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return; // Already installed, do nothing
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // If it's iOS and not standalone, we show the prompt after a delay
    if (isIOSDevice) {
      const hasDismissed = localStorage.getItem('azadar_install_dismissed');
      if (!hasDismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    // For Android/Chrome: listen to beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const hasDismissed = localStorage.getItem('azadar_install_dismissed');
      if (!hasDismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('azadar_install_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .install-prompt-card {
          animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
        }
        .install-prompt-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3) !important;
        }
      `}} />
      <div 
        className="install-prompt-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          bottom: '80px', // above bottom nav
          left: '20px',
          right: '20px',
          maxWidth: '400px',
          margin: '0 auto',
          background: 'var(--bg)', // Solid background
          border: '1px solid var(--line)',
          padding: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          outline: isHovered ? '1px solid var(--maroon)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--text)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
              AZ
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontFamily: 'var(--font-title)' }}>Install AzaHub</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                Add to your home screen for quick access to Majalis and Sabeels.
              </p>
            </div>
          </div>
          <button onClick={handleDismiss} style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-dim)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {isIOS ? (
          <div style={{ background: 'var(--surface-2)', padding: '16px', fontSize: '13px', color: 'var(--text-dim)', border: '1px solid var(--line)' }}>
            To install: Tap the <strong>Share</strong> icon below and select <strong>Add to Home Screen</strong>.
          </div>
        ) : (
          <button 
            onClick={handleInstall} 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '16px', 
              fontSize: '16px',
              background: 'var(--maroon)', 
              borderColor: 'var(--maroon)',
              transition: 'all 0.2s ease',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)'
            }}
          >
            Install App
          </button>
        )}
      </div>
    </>
  );
}
