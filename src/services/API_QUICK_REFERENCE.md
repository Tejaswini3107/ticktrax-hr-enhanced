# API Quick Reference Card

Fast reference for all 87 integrated API methods.

## 🔐 Authentication (4)

```javascript
await apiService.login({ email, password })
await apiService.register({ username, email, first_name, last_name, password, role_id })
await apiService.getCurrentUser()
await apiService.logout()
apiService.isAuthenticated() // Returns boolean
```

## 👤 User Profile (4)

```javascript
await apiService.getUserProfile()
await apiService.updateUserProfile({ first_name, last_name, phone, profile_picture })
await apiService.changePassword({ current_password, new_password, confirm_password })
await apiService.getUserDashboard()
```

## 🍕 Breaks (6)

```javascript
await apiService.startBreak({ break_type: 'regular' })
await apiService.endBreak()
await apiService.getBreakStatus()
await apiService.getBreakHistory({ page, limit, start_date, end_date })
await apiService.getBreakSummary(date)
```

## ⏰ Time Tracking (7)

```javascript
await apiService.clockIn({ latitude, longitude, work_location })
await apiService.clockOut({ latitude, longitude })
await apiService.getTimeStatus()
await apiService.getTimeEntries({ page, limit, start_date, end_date })
await apiService.createManualTimeEntry({ clock_in, clock_out, work_location, notes })
await apiService.updateTimeEntry(entryId, updates)
await apiService.deleteTimeEntry(entryId)
```

## ✅ Approvals (5)

```javascript
await apiService.getPendingApprovals({ page, limit })
await apiService.approveTimeEntry(entryId, { notes })
await apiService.rejectTimeEntry(entryId, { reason })
await apiService.bulkApproveEntries([entryId1, entryId2])
await apiService.getApprovalHistory({ page, limit })
```

## 📊 Analytics (5)

```javascript
await apiService.getAnalyticsOverview()
await apiService.getProductivityMetrics({ period: 'weekly' })
await apiService.getAttendanceAnalytics({ start_date, end_date })
await apiService.getOvertimeAnalytics({ period: 'monthly' })
await apiService.getTeamPerformance({ team_id })
```

## 📈 Reports (4)

```javascript
await apiService.generateTimesheetReport({ user_id, start_date, end_date, format })
await apiService.generateAttendanceReport({ team_id, start_date, end_date })
await apiService.generateProductivityReport({ period, format })
await apiService.exportReports({ type, format, start_date, end_date })
```

## ⚙️ Settings (8)

```javascript
await apiService.getProfileSettings()
await apiService.updateProfileSettings({ timezone, date_format, time_format })
await apiService.getNotificationSettings()
await apiService.updateNotificationSettings({ email_notifications, push_notifications })
await apiService.getWorkPreferences()
await apiService.updateWorkPreferences({ work_hours_per_day, work_days_per_week })
await apiService.getSystemSettings() // Admin
await apiService.updateSystemSettings({ company_name, default_work_hours }) // Admin
```

## 💰 Payroll (5)

```javascript
await apiService.getPayrollSummary({ period: 'current' })
await apiService.getPayrollHistory({ page, limit })
await apiService.generatePayroll({ start_date, end_date }) // Admin
await apiService.getPayRates()
await apiService.updatePayRates(userId, { hourly_rate, overtime_rate }) // Admin
```

## 🔔 Notifications (6)

```javascript
await apiService.listNotifications({ page, limit, unread_only })
await apiService.getUnreadCount()
await apiService.markNotificationRead(notificationId)
await apiService.markAllNotificationsRead()
await apiService.deleteNotification(notificationId)
await apiService.updateNotificationPreferences({ email_notifications, push_notifications })
```

## 👥 Users (5)

```javascript
await apiService.listUsers()
await apiService.createUser({ user: { first_name, last_name, email, username, password, role_id } })
await apiService.getUserById(userId)
await apiService.updateUser(userId, { user: { first_name, last_name, email } })
await apiService.deleteUser(userId)
```

## 👨‍👩‍👧‍👦 Teams (3)

```javascript
await apiService.listTeams()
await apiService.createTeam({ team: { name, description } })
await apiService.assignTeamManager(teamId, { manager_id })
```

## 📁 Projects (2)

```javascript
await apiService.listProjects()
await apiService.createProject({ project: { name, description } })
```

## ✓ Tasks (3)

```javascript
await apiService.listTasks()
await apiService.createTask({ task: { title, description, status, user_ids } })
await apiService.updateTaskStatus(taskId, status) // status: 1-4
```

## 📅 Schedules (3)

```javascript
await apiService.listSchedules()
await apiService.createSchedule({ schedule: { user_id, start_time, end_time, date } })
await apiService.createBatchSchedules([schedule1, schedule2, ...])
```

## ⏱️ Working Times (2)

```javascript
await apiService.listWorkingTimes()
await apiService.logUnpaidOvertime({ hours, date, reason })
```

---

## 🎯 Common Patterns

### With Loading State

```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await apiService.getTimeEntries();
    // Handle data
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

### With Error Handling

```javascript
try {
  const data = await apiService.someMethod();
  return { success: true, data };
} catch (error) {
  return { success: false, error: error.message };
}
```

### Pagination

```javascript
const fetchPage = async (page = 1) => {
  return await apiService.getTimeEntries({
    page,
    limit: 20,
    start_date: '2025-10-01',
    end_date: '2025-10-31'
  });
};
```

---

## 📝 Constants

```javascript
// Task Status
1: 'To Do'
2: 'In Progress'
3: 'Under Review'
4: 'Done'

// Break Types
'regular', 'lunch', 'personal'

// Report Formats
'pdf', 'excel', 'csv'

// Periods
'daily', 'weekly', 'monthly'
```

---

**Total Endpoints: 87**  
**See:** [Full API Usage Guide](./API_USAGE_GUIDE.md)

