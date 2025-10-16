# TickTrax HR Mobile App

## 📱 iOS Mobile Application

This directory contains the Cordova-based mobile application for TickTrax HR, designed for iOS devices.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Cordova CLI** (installed locally)
- **Xcode** (for iOS development)
- **iOS Simulator** (for testing)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the mobile app:**
   ```bash
   ./build-mobile.sh
   ```

3. **Run in iOS Simulator:**
   ```bash
   cd mobile
   npx cordova run ios
   ```

## 🔧 Development

### Building for iOS

```bash
# Build web assets and copy to mobile
npm run build
cp -r www/* mobile/www/

# Navigate to mobile directory
cd mobile

# Prepare Cordova
npx cordova prepare

# Build for iOS
npx cordova build ios
```

### Running in Simulator

```bash
cd mobile
npx cordova run ios
```

### Building for Device

```bash
cd mobile
npx cordova build ios --device
```

## 📱 Features

### Mobile-Specific Features

- **Offline Support**: Works without internet connection
- **Push Notifications**: Real-time updates and alerts
- **Camera Integration**: Photo capture for time entries
- **Geolocation**: Location-based clock in/out
- **Biometric Authentication**: Touch ID / Face ID support
- **Native Performance**: Optimized for mobile devices

### Cordova Plugins

- **Device Information**: Access device details
- **Geolocation**: GPS-based location services
- **Camera**: Photo capture functionality
- **Network Information**: Connection status monitoring
- **Status Bar**: Custom status bar styling
- **Splash Screen**: Professional app loading
- **Whitelist**: Security and access control

## 🎨 Mobile UI Features

- **Responsive Design**: Optimized for all iOS screen sizes
- **Touch-Friendly**: Large buttons and touch targets
- **Swipe Navigation**: Intuitive gesture controls
- **Dark Mode**: Automatic theme switching
- **Accessibility**: VoiceOver and accessibility support

## 📦 Project Structure

```
mobile/
├── config.xml          # Cordova configuration
├── package.json        # Mobile app dependencies
├── www/                # Web assets (copied from build)
│   ├── index.html
│   ├── assets/
│   └── icons/
├── platforms/          # Platform-specific code
│   └── ios/           # iOS project files
├── plugins/           # Cordova plugins
└── res/              # App resources (icons, splash screens)
```

## 🔧 Configuration

### App Configuration

- **App ID**: `com.ticktrax.hr`
- **App Name**: `TickTrax HR`
- **Version**: `1.0.0`
- **Platform**: iOS 12.0+

### Build Configuration

- **Minimum iOS Version**: 12.0
- **Target iOS Version**: 16.0+
- **Architecture**: arm64, armv7
- **Orientation**: Portrait only

## 🚀 Deployment

### Development Build

```bash
# Build for development
npx cordova build ios --debug
```

### Production Build

```bash
# Build for production
npx cordova build ios --release
```

### App Store Deployment

1. **Archive the app in Xcode**
2. **Upload to App Store Connect**
3. **Submit for review**

## 🧪 Testing

### iOS Simulator

```bash
cd mobile
npx cordova run ios --target="iPhone 14"
```

### Physical Device

```bash
cd mobile
npx cordova run ios --device
```

## 📱 Mobile Features

### Time Tracking

- **Clock In/Out**: GPS-based location verification
- **Break Management**: Automatic break tracking
- **Overtime Calculation**: Real-time overtime monitoring
- **Photo Capture**: Attach photos to time entries

### Employee Management

- **Profile Management**: Update personal information
- **Schedule View**: View work schedules
- **Time Reports**: Generate time reports
- **Notifications**: Real-time updates

### HR Features

- **Employee Directory**: Browse team members
- **Approval Workflow**: Approve time entries
- **Reports**: Generate HR reports
- **Settings**: Configure app preferences

## 🔒 Security

- **HTTPS Only**: All API calls use HTTPS
- **Token Authentication**: Secure JWT tokens
- **Biometric Login**: Touch ID / Face ID
- **Data Encryption**: Local data encryption
- **Secure Storage**: Keychain integration

## 📊 Performance

- **Fast Loading**: Optimized bundle size
- **Smooth Animations**: 60fps performance
- **Memory Efficient**: Optimized memory usage
- **Battery Friendly**: Efficient background processing

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**: Check Xcode and iOS SDK versions
2. **Plugin Issues**: Reinstall Cordova plugins
3. **Simulator Issues**: Reset iOS Simulator
4. **Device Issues**: Check device provisioning

### Debug Commands

```bash
# Check Cordova version
npx cordova --version

# List platforms
npx cordova platform list

# List plugins
npx cordova plugin list

# Clean build
npx cordova clean
```

## 📞 Support

For mobile app support:
- **Email**: mobile-support@ticktrax.com
- **Documentation**: [Mobile Docs](https://docs.ticktrax.com/mobile)
- **Issues**: [GitHub Issues](https://github.com/ticktrax/mobile/issues)

## 📄 License

MIT License - See LICENSE file for details.
