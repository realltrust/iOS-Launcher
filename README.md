# iOS Launcher Clone (Expo / React Native)

This is a split-file refactor of the original giant `App.js`.

## What is real now

- Weather uses the device location plus Open-Meteo.
- Calendar uses the device calendar permission and real upcoming events.
- Battery reads live device battery data.
- Photos reads recent media library items.
- Tasks are persisted locally with AsyncStorage.
- Apps are user-managed launch targets, opened through real URLs or schemes.

## Important iOS limitation

A third-party app cannot replace the iPhone home screen. This project is a launcher-style app, not a system launcher.

## Install

```bash
npx expo install expo-linear-gradient expo-blur expo-haptics expo-location expo-battery expo-calendar expo-media-library expo-image
npm install @react-navigation/native @react-navigation/native-stack @react-native-async-storage/async-storage react-native-safe-area-context react-native-screens
```

## Notes

- Add permissions in `app.json` / `app.config.js` for location, calendar, and photo library usage strings.
- To launch another app, add its custom URL scheme or universal link in the app editor.
- Empty state is intentional until the user adds apps.
