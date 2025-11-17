# How to Access the Mobile App

## Option 1: Expo DevTools (Easiest - Shows QR Code)
1. Once Expo starts, open your web browser
2. Go to: **http://localhost:8081** (or http://localhost:8082 if using that port)
3. You'll see the Expo DevTools with a **QR code** you can scan

## Option 2: Direct Connection URL
1. In your terminal, look for a line that says:
   ```
   › Metro waiting on exp://192.168.x.x:8081
   ```
2. Copy that URL (starts with `exp://`)
3. In Expo Go app on your phone, tap "Enter URL manually"
4. Paste the URL

## Option 3: Find Your IP Address
1. Run this command in terminal:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. Look for your local IP (usually starts with 192.168.x.x or 10.x.x.x)
3. In Expo Go, connect to: `exp://YOUR_IP:8081`

## Option 4: Use Expo Go App's "Scan QR Code"
1. Open Expo Go app on your phone
2. Make sure your phone is on the same WiFi network as your computer
3. Tap "Scan QR Code"
4. The QR code should appear in:
   - Expo DevTools (http://localhost:8081) in your browser
   - Or use a QR code generator with the exp:// URL

## Option 5: iOS Simulator / Android Emulator
If you have simulators installed:
- Press `i` in the Expo terminal for iOS simulator
- Press `a` in the Expo terminal for Android emulator

## Troubleshooting
- **Port 8081 in use**: Use port 8082 (already accepted)
- **Can't see QR code**: Use Expo DevTools in browser (Option 1)
- **Connection issues**: Make sure phone and computer are on same WiFi
- **Package warnings**: The app should still work, but you can update packages later:
  ```bash
  npm install @expo/vector-icons@^15.0.3 expo@54.0.22 react-native@0.81.5
  ```


