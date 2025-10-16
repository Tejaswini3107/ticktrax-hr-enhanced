<template>
  <div v-if="!user" class="h-screen overflow-hidden">
    <LoginScreen @login="handleLogin" />
  </div>

  <div v-else class="h-screen overflow-hidden">
    <DashboardLayout
      :currentRole="user.role"
      @roleChange="handleRoleChange"
      :userName="user.name"
      :notifications="3"
      :currentView="currentView"
      @viewChange="setCurrentView"
      @logout="handleLogout"
      @profileClick="handleProfileClick"
    >
      <component
        :is="dashboardComponent"
        :currentView="currentView"
        @viewChange="setCurrentView"
        :currentRole="user.role"
      />
    </DashboardLayout>

    <ProfileDialog
      :open="isProfileOpen"
      @openChange="setIsProfileOpen"
      :user="profileUser"
    />
  </div>
</template>

<script>
import LoginScreen from './components/auth/LoginScreen.vue';
import DashboardLayout from './components/DashboardLayout.vue';
import EmployeeDashboard from './components/dashboards/EmployeeDashboard.vue';
import ManagerDashboard from './components/dashboards/ManagerDashboard.vue';
import AdminDashboard from './components/dashboards/AdminDashboard.vue';
import HRDashboard from './components/dashboards/HRDashboard.vue';
import ProfileDialog from './components/dialogs/ProfileDialog.vue';

// Import HR side pages
import EmployeeManagement from './components/hr/EmployeeManagement.vue';
import Recruitment from './components/hr/Recruitment.vue';
import PerformanceManagement from './components/hr/PerformanceManagement.vue';
import PayrollManagement from './components/hr/PayrollManagement.vue';
import HRReports from './components/hr/HRReports.vue';
import { toast } from 'sonner';

export default {
  name: 'MainApp',
  components: {
    LoginScreen,
    DashboardLayout,
    EmployeeDashboard,
    ManagerDashboard,
    AdminDashboard,
    HRDashboard,
    ProfileDialog,
    // HR side pages
    EmployeeManagement,
    Recruitment,
    PerformanceManagement,
    PayrollManagement,
    HRReports,
  },
  data() {
    return {
      user: null,
      currentView: 'dashboard',
      isProfileOpen: false,
    };
  },
  computed: {
    dashboardComponent() {
      // Handle HR side pages
      if (this.user.role === 'hr' || this.user.role === 'admin') {
        switch (this.currentView) {
          case 'employees':
            return 'EmployeeManagement';
          case 'recruitment':
            return 'Recruitment';
          case 'performance':
            return 'PerformanceManagement';
          case 'payroll':
            return 'PayrollManagement';
          case 'reports':
            return 'HRReports';
          default:
            return 'HRDashboard';
        }
      }
      
      // Handle other roles
      switch (this.user.role) {
        case 'employee':
          return 'EmployeeDashboard';
        case 'manager':
          return 'ManagerDashboard';
        case 'hr':
          return 'HRDashboard';
        case 'admin':
          return 'AdminDashboard';
        default:
          return 'EmployeeDashboard';
      }
    },
    profileUser() {
      if (!this.user) return {};
      return {
        name: this.user.name,
        role: this.user.role,
        email: `${this.user.name.toLowerCase().replace(' ', '.')}@company.com`,
        phone: '+1 (555) 123-4567',
        department: 'Engineering',
        location: 'New York, NY',
        startDate: '2023-01-15',
        employeeId: 'EMP001',
      };
    },
  },
  methods: {
    handleLogin(name, role) {
      this.user = { name, role };
      // If we're embedded inside the mobile wrapper, don't override its
      // currentView. MobileAppWrapper manages navigation itself.
      if (typeof window !== 'undefined' && window.__isMobileWrapper) {
        console.debug('[MainApp] handleLogin skipped setting currentView because running inside mobile wrapper');
        return;
      }

      console.debug('[MainApp] handleLogin setting currentView to dashboard');
      console.trace('[MainApp] handleLogin stack trace');
      this.currentView = 'dashboard';
    },
    handleLogout() {
      this.user = null;
      if (typeof window !== 'undefined' && window.__isMobileWrapper) {
        console.debug('[MainApp] handleLogout skipped setting currentView because running inside mobile wrapper');
      } else {
        console.debug('[MainApp] handleLogout setting currentView to dashboard');
        console.trace('[MainApp] handleLogout stack trace');
        this.currentView = 'dashboard';
      }
    },
    handleRoleChange(newRole) {
      if (this.user) {
        this.user = { ...this.user, role: newRole };
        if (typeof window !== 'undefined' && window.__isMobileWrapper) {
          console.debug('[MainApp] handleRoleChange skipped setting currentView because running inside mobile wrapper');
        } else {
          console.debug('[MainApp] handleRoleChange setting currentView to dashboard');
          console.trace('[MainApp] handleRoleChange stack trace');
          this.currentView = 'dashboard';
        }
        toast.success(`Switched to ${newRole} role`);
      }
    },
    handleProfileClick() {
      this.isProfileOpen = true;
    },
    setCurrentView(view) {
      console.debug('[MainApp] setCurrentView ->', view);
      console.trace('[MainApp] setCurrentView stack trace');
      this.currentView = view;
    },
    setIsProfileOpen(isOpen) {
      this.isProfileOpen = isOpen;
    },
  },
};
</script>
