import { Capacitor } from '@capacitor/core';



/**

 * API base URL — public HTTPS backend (Railway, Render, etc.)

 *

 * - Vercel frontend: set VITE_API_BASE_URL in Vercel → Environment Variables

 * - APK build: set VITE_API_BASE_URL in .env.production before npm run build

 * - Dev browser: Vite proxy or LAN fallback below

 */

function normalizeBaseUrl(raw: string): string {

  let url = raw.trim().replace(/\/+$/, '');

  if (!/^https?:\/\//i.test(url)) {

    url = `https://${url}`;

  }

  return url;

}



function resolveApiBaseUrl(): string {

  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;



  if (fromEnv?.trim()) {

    return normalizeBaseUrl(fromEnv);

  }



  // Dev-only fallback (browser + same Wi‑Fi phone testing)

  if (!import.meta.env.PROD && !Capacitor.isNativePlatform()) {

    return normalizeBaseUrl('http://192.168.100.13:3001');

  }



  console.error(

    '[api] Missing VITE_API_BASE_URL. Set your Railway API URL in Vercel env vars or .env.production for APK.',

  );



  return '';

}



export const API_BASE_URL = resolveApiBaseUrl();



export const apiUrl = (path: string): string => {

  const segment = path.startsWith('/') ? path : `/${path}`;

  return `${API_BASE_URL}${segment}`;

};



export const apiFetch = async (path: string, init?: RequestInit): Promise<Response> => {

  if (!API_BASE_URL) {

    throw new Error(

      'Server URL not configured. Set VITE_API_BASE_URL to your Railway API URL.',

    );

  }

  const url = apiUrl(path);

  try {

    return await fetch(url, init);

  } catch (err) {

    console.error(`[api] Network error for ${url}`, err);

    throw err;

  }

};

