import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.multimilla.app',
  appName: 'Multimilla',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'dark',
    },
    SplashScreen: {
      "launchShowDuration": 2000,
      "launchAutoHide": true, 
      "backgroundColor": "#1EB86F",
      "androidSplashResourceName": "splash",
      "androidScaleType": "CENTER_CROP",
      "showSpinner": false,
      "androidSpinnerStyle": "small",
      "iosSpinnerStyle": "small",
      "splashFullScreen": true,
      "splashImmersive": true,
    },
    StatusBar: {
      backgroundColor: "#1EB86F",
      style: 'LIGHT',
      overlaysWebView: false,
    }

  }
};

export default config;
