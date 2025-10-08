# TickTrax Mobile App Setup

## 📱 Cordova Integration

Your TickTrax time tracking app has been set up for mobile deployment using Apache Cordova. This allows you to build native iOS and Android apps from your Vue.js web application.

## 🚀 Quick Start

### Prerequisites
- Node.js and npm installed
- For iOS: Xcode and iOS SDK
- For Android: Android Studio and Android SDK

### Build Mobile App

1. **Prepare mobile build:**
   ```bash
   npm run mobile:prepare
   ```

2. **Build for both platforms:**
   ```bash
   npm run mobile:build
   ```

3. **Build for specific platform:**
   ```bash
   npm run mobile:build:android
   npm run mobile:build:ios
   ```

### Run on Device/Emulator

1. **Run on Android:**
   ```bash
   npm run mobile:run:android
   ```

2. **Run on iOS:**
   ```bash
   npm run mobile:run:ios
   ```

### Open in IDE

1. **Open Android project in Android Studio:**
   ```bash
   npm run mobile:open:android
   ```

2. **Open iOS project in Xcode:**
   ```bash
   npm run mobile:open:ios
   ```

## 📁 Project Structure

```
├── mobile/                 # Cordova project directory
│   ├── config.xml         # Cordova configuration
│   ├── platforms/         # Platform-specific code (auto-generated)
│   ├── plugins/           # Cordova plugins
│   └── www/               # Web app build output (auto-generated)
├── src/
│   ├── services/
│   │   ├── cordovaService.js    # Native device features
│   │   └── mobileService.js     # Mobile-specific functionality
│   └── components/
│       └── mobile/        # Mobile-optimized components
├── build-mobile.sh        # Mobile build script
└── package.json          # Includes mobile build scripts
```

## 🔧 Features Included

### Native Device Features
- **GPS Location** - For location-based clock in/out
- **Camera Access** - For profile photos and document scanning
- **Push Notifications** - For reminders and alerts
- **Vibration** - For haptic feedback
- **Network Detection** - For offline functionality
- **Status Bar Control** - For immersive experience

### Mobile-Optimized UI
- **Responsive Design** - Works on all screen sizes
- **Touch-Friendly** - Large touch targets (44px minimum)
- **Safe Area Support** - Handles notched devices (iPhone X+)
- **Bottom Navigation** - Easy thumb access
- **Swipe Gestures** - Natural mobile interactions

### Offline Capabilities
- **Service Worker** - Caches app for offline use
- **IndexedDB** - Stores data locally
- **Background Sync** - Syncs data when online
- **Offline Clock In/Out** - Works without internet

## 📱 Platform-Specific Notes

### iOS
- Requires Apple Developer account for device testing
- Uses WKWebView for better performance
- Automatic safe area handling for notched devices
- Location permission descriptions included

### Android
- Minimum SDK: Android 7.0 (API 24)
- Target SDK: Android 14 (API 35)
- Uses AndroidX libraries
- Handles various screen sizes and densities

## 🔐 Permissions

The app requests these permissions:
- **Location** - For work location verification
- **Camera** - For profile photos and document scanning
- **Network** - For API communication
- **Vibration** - For haptic feedback
- **Storage** - For offline data and file uploads

## 🛠 Customization

### App Icons and Splash Screens
Add your custom icons and splash screens to:
- `mobile/res/ios/` - iOS icons and splash screens
- `mobile/res/android/` - Android icons and splash screens

### Configuration
Edit `mobile/config.xml` to customize:
- App name and description
- Bundle ID and version
- Permissions and features
- Platform-specific settings

### Plugins
Add more Cordova plugins as needed:
```bash
cd mobile
npx cordova plugin add plugin-name
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures:**
   - Ensure all SDKs are properly installed
   - Check platform requirements
   - Clean and rebuild: `cd mobile && npx cordova clean`

2. **Plugin Conflicts:**
   - Remove and re-add plugins
   - Check plugin compatibility with Cordova version

3. **Performance Issues:**
   - Enable hardware acceleration
   - Optimize images and assets
   - Use production build: `npm run build`

### Getting Help

1. Check Cordova documentation: https://cordova.apache.org/docs/
2. Review plugin documentation for specific features
3. Check platform-specific guides for iOS/Android setup

## 📈 Next Steps

1. **Test on Real Devices** - Always test on actual mobile devices
2. **App Store Deployment** - Prepare for App Store/Play Store submission
3. **Performance Optimization** - Monitor and optimize app performance
4. **User Feedback** - Gather feedback from mobile users
5. **Analytics** - Add mobile analytics tracking

Your TickTrax app is now ready for mobile deployment! 🎉
