// The Android app: the release web build in a Capacitor WebView (game-release templates/android).
// .github/workflows/android.yml builds the web, runs `npx cap sync android`, then the APK.
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.github.heirsofruin.inthetrenches', // never change after the first published APK
  appName: 'In the Trenches',
  webDir: 'dist',
  android: { backgroundColor: '#12120e' },
};

export default config;
