import React from 'react';
import { AbnLogo } from '../components/AbnLogo';

interface SplashScreenProps {
  fading?: boolean;
}

/** Initial welcome splash — premium emblem on solid dark background */
export const SplashScreen: React.FC<SplashScreenProps> = ({ fading = false }) => (
  <div
    className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0705] transition-opacity duration-500 ${
      fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}
    id="splash-screen"
    style={{
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}
  >
    <AbnLogo size="splash" className="mx-auto" />
  </div>
);
