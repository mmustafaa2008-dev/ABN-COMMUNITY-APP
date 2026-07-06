import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.shiabusinessdirectory',
  appName: 'ANV',
  webDir: 'dist',
  android: {
    // Allow the WebView to draw behind the status bar
    backgroundColor: '#0A0705',
  },
  plugins: {
    // Ensure safe-area insets are forwarded to the WebView
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0A0705',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
