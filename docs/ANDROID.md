# The Android app

The Android download is the game's release web build inside a Capacitor
WebView. It plays offline; the app keeps the saves on the phone. Built by
GitHub (`.github/workflows/android.yml`), never on your own machine.

## One-time setup

1. `npm i -D @capacitor/cli @capacitor/core @capacitor/android`
2. Copy `capacitor.config.ts` (from the game-release templates) to the repo root.
   **The appId is permanent** once an APK is published.
3. `npx cap add android` (creates `android/`; commit it).
4. In `android/app/build.gradle`, inside `android { ... }`:
   - in `defaultConfig`: `versionCode((System.getenv("ANDROID_VERSION_CODE") ?: "1") as int)`
     (each CI build counts up, so a new APK installs over the old and keeps the saves)
   - add the signing block:
     ```
     signingConfigs {
         release {
             if (System.getenv("ANDROID_KEYSTORE_FILE")) {
                 storeFile file(System.getenv("ANDROID_KEYSTORE_FILE"))
                 storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
                 keyAlias System.getenv("ANDROID_KEY_ALIAS") ?: "release"
                 keyPassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
             }
         }
     }
     buildTypes { release { if (System.getenv("ANDROID_KEYSTORE_FILE")) signingConfig signingConfigs.release } }
     ```
5. Copy `android.yml` to `.github/workflows/android.yml`.
6. Make the signing key once, on any machine with a JDK:
   `keytool -genkeypair -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000`
   then add two repository secrets (Settings > Secrets and variables > Actions):
   `ANDROID_KEYSTORE_BASE64` = `base64 -w0 release.keystore`, and `ANDROID_KEYSTORE_PASSWORD`.

**Keep the keystore and its password outside GitHub** (a password manager). If
it is lost, the published app can never be updated: players would have to
uninstall, losing their saves.

## Each release

Actions > Android app > the latest run > Artifacts > `<slug>-android`. Put the
APK at `release/<slug>.apk`, run `node tools/make-itch-kit.mjs`, upload it with
only Android ticked. Players allow "install unknown apps" when Android asks.
