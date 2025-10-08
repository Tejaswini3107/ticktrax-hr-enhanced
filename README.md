# TickTrax - Time Tracking System

A comprehensive, user-friendly time tracking application built with Vue.js 3, featuring role-based access control, modern UI components, and secure authentication.

## 🚀 Features

### Core Functionality
- **Time Tracking**: Clock in/out with location tracking
- **Role-Based Access**: Employee, Manager, and Admin dashboards
- **Timesheet Management**: View, edit, and approve timesheets
- **Reporting**: Comprehensive reports for different user roles
- **Schedule Management**: Create and manage work schedules
- **Profile Management**: User profile and settings

### User Roles
- **Employee**: Clock in/out, view timesheets, manage schedule
- **Manager**: Team oversight, timesheet approval, team reports
- **Admin**: Full system access, user management, system reports

### Technical Features
- **Modern UI**: Built with Vue.js 3 and Tailwind CSS
- **Secure Authentication**: JWT tokens with CSRF protection
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Support**: Light and dark mode
- **Real-time Updates**: Live time tracking and notifications

## 🛠️ Technology Stack

- **Frontend**: Vue.js 3, Composition API
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Icons**: Lucide Vue Next
- **Build Tool**: Vite
- **Authentication**: JWT with HTTP-only cookies
- **State Management**: Vue Reactivity API

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ticktrax
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3005` (or the port shown in terminal)

## 🔐 Authentication

The application includes a robust authentication system:

### Demo Accounts
For development and testing, use these demo accounts:

- **Employee**: `john.doe` / `demo123`
- **Manager**: `sarah.manager` / `demo123`
- **Admin**: `system.admin` / `demo123`

### Production Authentication
The app is configured to work with a backend API:

- **Login Endpoint**: `/api/auth/login`
- **Logout Endpoint**: `/api/auth/logout`
- **Profile Endpoint**: `/api/user/profile`
- **Token Storage**: JWT in HTTP-only cookies, CSRF token in localStorage

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboards/     # Role-specific dashboards
│   ├── dialogs/        # Modal dialogs
│   ├── reports/        # Reporting components
│   ├── special/        # Specialized components
│   └── ui/             # Reusable UI components
├── services/
│   └── authService.js  # Authentication service
├── styles/
│   └── globals.css     # Global styles
└── main.js             # Application entry point
```

## 🎨 UI Components

The application uses a custom component library built on top of Tailwind CSS:

- **Cards**: Content containers with consistent styling
- **Buttons**: Various button styles and states
- **Forms**: Input fields, labels, and validation
- **Dialogs**: Modal dialogs for user interactions
- **Tables**: Data display with sorting and pagination
- **Charts**: Data visualization components
- **Navigation**: Sidebar and breadcrumb navigation

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=TickTrax
```

### Vite Configuration
The project uses Vite for development and building. Configuration is in `vite.config.js`.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Kiosk mode for shared devices

## 🌙 Theme Support

- **Light Mode**: Default theme with clean, professional appearance
- **Dark Mode**: Dark theme for reduced eye strain
- **System Preference**: Automatically follows system theme preference

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📊 API Integration

The application is designed to work with a REST API:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/user/profile` - Get user profile

### Time Tracking Endpoints
- `POST /api/time/clock-in` - Clock in
- `POST /api/time/clock-out` - Clock out
- `GET /api/time/entries` - Get time entries
- `PUT /api/time/entries/:id` - Update time entry

### Reporting Endpoints
- `GET /api/reports/timesheet` - Timesheet reports
- `GET /api/reports/team` - Team reports
- `GET /api/reports/admin` - Admin reports

## 🧪 Testing

### Demo Mode
The application includes a demo mode that works without a backend:
- Uses predefined demo accounts
- Simulates API responses
- Perfect for development and testing

### Production Mode
When connected to a backend API:
- Real authentication
- Live data synchronization
- Full feature set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the demo guide
- Open an issue on GitHub

## 🔄 Recent Updates

- ✅ Fixed authentication token management
- ✅ Added secure JWT + CSRF token handling
- ✅ Improved error handling and user feedback
- ✅ Enhanced demo mode functionality
- ✅ Added loading states and better UX

---

**TickTrax** - Making time tracking simple and efficient.