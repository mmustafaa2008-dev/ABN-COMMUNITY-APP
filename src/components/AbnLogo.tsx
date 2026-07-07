import React from 'react';

const SIZE_CLASSES = {
  sm:     'h-8 w-auto max-w-[80px]',
  md:     'h-11 w-auto max-w-[104px]',
  lg:     'h-14 w-auto max-w-[128px]',
  hero:   'h-[72px] w-auto max-w-[168px]',
  splash: 'h-[min(42vw,220px)] w-auto max-w-[min(88vw,320px)]',
} as const;

export type AbnLogoSize = keyof typeof SIZE_CLASSES;

interface AbnLogoProps {
  size?: AbnLogoSize;
  className?: string;
}

/** Official ABN premium logo — emblem + "ABN" + "SINCE 2026" */
export const AbnLogo: React.FC<AbnLogoProps> = ({ size = 'md', className = '' }) => (
  <img
    src="/abn-logo.png"
    alt="ABN — Ahle Bait Network since 2026"
    className={`object-contain object-center ${SIZE_CLASSES[size]} ${className}`.trim()}
    draggable={false}
  />
);
