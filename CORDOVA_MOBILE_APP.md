# 📱 TickTrax Cordova Mobile App Integration

## ✅ Complete Cordova Integration

### 🎯 Features Integrated:

#### 1. **Backend API Integration** ✅
- Login/Logout with real API
- Clock In/Out with location tracking
- Time entries from database
- Real-time data synchronization
- User authentication with JWT tokens

#### 2. **Native Device Features** ✅
- **Geolocation**: GPS tracking for clock in/out
- **Camera**: Profile photos and document scanning
- **Vibration**: Haptic feedback on actions
- **Status Bar**: Custom styling for iOS/Android
- **Network Detection**: Online/offline status
- **Back Button**: Android hardware back button handling

#### 3. **Cordova Plugins Installed** ✅
- `cordova-plugin-statusbar` - Status bar customization
- `cordova-plugin-device` - Device information
- `cordova-plugin-geolocation` - GPS/location services
- `cordova-plugin-camera` - Camera access
- `cordova-plugin-network-information` - Network status
- `cordova-plugin-whitelist` - Security permissions

## 🚀 How to Build & Run

### **Option 1: Browser Testing (No SDK Required)**
```bash
cd mobile
npx cordova run browser
```
Then open: http://localhost:8000

### **Option 2: Android APK (Requires Android SDK)**

#### Prerequisites:
1. Install Android Studio
2. Install Android SDK (API 35)
3. Set environment variables:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### Build APK:
```bash
cd mobile
npx cordova build android
```

#### Run on Device:
```bash
cd mobile
npx cordova run android
```

#### Output:
- Debug APK: `mobile/platforms/android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `mobile/platforms/android/app/build/outputs/apk/release/app-release.apk`

### **Option 3: iOS App (Requires macOS + Xcode)**

#### Prerequisites:
1. macOS with Xcode installed
2. iOS development certificates

#### Build:
```bash
cd mobile
npx cordova build ios
```

#### Open in Xcode:
```bash
cd mobile
npx cordova open ios
```

## 🔧 Cordova Integration Service

### **Location:** `src/services/cordovaIntegration.js`

### **Usage Examples:**

```javascript
import cordovaIntegration from './services/cordovaIntegration.js';

// Check if running in Cordova
if (cordovaIntegration.isCordova()) {
  console.log('Running in mobile app');
}

// Get current location
const location = await cordovaIntegration.getCurrentLocation();
console.log('Lat:', location.latitude, 'Lng:', location.longitude);

// Take photo
const photo = await cordovaIntegration.takePicture();

// Vibrate device
cordovaIntegration.vibrate(100);

// Check network status
if (cordovaIntegration.isOnline()) {
  console.log('Online');
}

// Listen to events
cordovaIntegration.on('networkStatusChanged', (status) => {
  console.log('Network:', status);
});
```

## 📊 API Integration Details

### **Backend URL:**
```
https://batman-api-a20b3a37aa3c.herokuapp.com/api
```

### **Endpoints Used:**

| Feature | Method | Endpoint |
|---------|--------|----------|
| Login | POST | `/auth/login` |
| Logout | POST | `/auth/logout` |
| Clock In | POST | `/time/clock-in` |
| Clock Out | POST | `/time/clock-out` |
| Get Status | GET | `/time/status` |
| Time Entries | GET | `/workingtime/:userId` |
| User Profile | GET | `/auth/me` |

### **Authentication:**
- JWT tokens stored in localStorage
- Authorization header: `Bearer {token}`
- CSRF token for state-changing requests

## 📱 Mobile-Specific Features

### **1. Location Tracking**
- Automatically gets GPS coordinates on clock in/out
- High accuracy mode for better precision
- Falls back gracefully if location denied

### **2. Vibration Feedback**
- 100ms vibration on clock in
- 200ms vibration on clock out
- Haptic feedback for better UX

### **3. Network Detection**
- Online/offline status monitoring
- Automatic sync when connection restored
- Offline mode support (coming soon)

### **4. Status Bar Styling**
- iOS: Light content on blue background
- Android: Blue background (#2563eb)
- No overlay on webview

## 🧪 Testing

### **Test Accounts:**

```javascript
// Admin
Email: testadmin@example.com
Password: admin123

// Manager
Email: testmanager@example.com
Password: manager123

// HR
Email: testhr@example.com
Password: hr123456
```

### **Test Workflow:**

1. **Login** - Authenticates with backend API
2. **Clock In** - Gets location, sends to API
3. **View Dashboard** - Shows real data from API
4. **Clock Out** - Gets location, sends to API
5. **View Reports** - Real time entries from database

## 📦 Build Scripts

### **Main Build Script:** `build-mobile.sh`
```bash
#!/bin/bash
# Builds web app
npm run build

# Copies to Cordova
cp -r build/* mobile/www/

# Prepares platforms
cd mobile && npx cordova prepare
```

### **Quick Rebuild:**
```bash
./build-mobile.sh
```

## 🔒 Security

### **Content Security Policy:**
```xml
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' data: https: 'unsafe-inline' 'unsafe-eval';" />
```

### **Permissions (Android):**
- `ACCESS_NETWORK_STATE` - Network detection
- `ACCESS_FINE_LOCATION` - GPS tracking
- `ACCESS_COARSE_LOCATION` - Network location
- `CAMERA` - Photo capture

### **Permissions (iOS):**
- Location When In Use
- Camera Access

## 📱 App Information

- **Package ID:** `com.ticktrax.app`
- **App Name:** TickTrax
- **Version:** 1.0.0
- **Min SDK (Android):** API 24 (Android 7.0)
- **Target SDK (Android):** API 35
- **iOS Deployment Target:** iOS 13.0+

## 🎨 Mobile UI

- **Responsive design** - Adapts to mobile screens
- **Touch-friendly** - Large buttons and inputs
- **Native feel** - Platform-specific styling
- **PWA ready** - Can be installed as Progressive Web App

## 🔄 Real-Time Features

- Live clock updates
- Push notifications (ready to implement)
- Background sync (ready to implement)
- WebSocket support for instant updates

## 📝 Next Steps

### **To Deploy:**

1. **Android:**
   - Generate signed APK for release
   - Upload to Google Play Store

2. **iOS:**
   - Configure provisioning profiles
   - Build release version
   - Upload to App Store

3. **PWA:**
   - App already works as PWA
   - Can be installed from browser

## ✅ Checklist

- [x] Backend API integrated
- [x] Login/logout working
- [x] Clock in/out with location
- [x] Real-time data sync
- [x] Cordova plugins installed
- [x] Native device features
- [x] Build scripts ready
- [x] Browser testing works
- [ ] Android APK tested on device
- [ ] iOS app tested on device
- [ ] Production release build

## 🆘 Troubleshooting

### **"ANDROID_HOME not found"**
Install Android Studio and set environment variable

### **"Device not recognized"**
Enable USB debugging on Android device

### **"Location permission denied"**
Request permissions in app settings

### **Build fails**
Clean and rebuild:
```bash
cd mobile
npx cordova clean
npx cordova prepare
npx cordova build android
```

## 📞 Support

For issues or questions about the mobile app integration, check:
- Console logs in browser DevTools
- Cordova documentation: https://cordova.apache.org/docs
- Backend API documentation: `BACKEND_API_GUIDE.md`

---

**🎉 Your mobile app is ready with full backend integration!**

