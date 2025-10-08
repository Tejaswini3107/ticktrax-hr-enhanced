# Interactive Popups & Dialogs Guide

## Overview

The Time Manager Pro system now includes comprehensive modal dialogs for all major actions, providing a better user experience with detailed information display and streamlined workflows.

## Available Dialogs

### 1. Employee Details Dialog
**Location:** Admin Dashboard → Employees → "View" button

**Features:**
- **Three Tab Interface:**
  - **Overview Tab:** Personal info, contact details, employment details, and quick stats
  - **Time Records Tab:** Recent time entries with full history
  - **Performance Tab:** Monthly metrics and attendance statistics

**Information Displayed:**
- Full name and employee ID
- Email, phone, location
- Department, role, employee type
- Employment status
- Hours this week/month
- Attendance rate (98.5%)
- Monthly metrics and performance data

**Actions:**
- Close dialog
- Edit Employee (opens Add/Edit dialog)

---

### 2. Add/Edit Employee Dialog
**Location:** Admin Dashboard → "Add Employee" button or Edit from Details dialog

**Features:**
- **Personal Information Section:**
  - Full Name (required)
  - Email Address (required)
  - Phone Number (optional)
  - Hire Date (optional)

- **Employment Details Section:**
  - Department dropdown (required) - Production, Warehouse, Field Service, etc.
  - Role dropdown (required) - Employee, Manager, HR, Admin
  - Employee Type (required) - Regular, Field Worker, Warehouse
  - Work Location (optional)

**Form Validation:**
- Required fields marked with asterisk (*)
- Email format validation
- Real-time error checking

**Actions:**
- Cancel (discard changes)
- Add/Update Employee with loading state
- Success/error notifications via toast

---

### 3. Approval Dialog
**Location:** Manager Dashboard → Approvals → "Review" button

**Features:**
- **Two-Step Approval Process:**
  1. **Review Entry:** Shows all entry details
     - Employee name
     - Date
     - Clock in/out times
     - Total hours
     - Overtime indicator
     - Employee notes

  2. **Take Action:** Choose approve or reject
     - Approve: Optional notes
     - Reject: Reason required

- **Overtime Warning:**
  - Visual alert for overtime entries
  - Reminds manager to verify authorization

**Workflow:**
1. Click "Review" on any pending entry
2. Review entry details
3. Click "Approve" or "Reject"
4. Add notes/reason
5. Confirm action
6. Toast notification confirms success

---

### 4. Timesheet Details Dialog
**Location:** Employee Dashboard → Timesheet → "View Details" button

**Features:**
- **Summary Cards:**
  - Total Hours (with icon)
  - Regular Hours
  - Overtime Hours

- **Detailed Time Entries Table:**
  - Date
  - Clock in/out times
  - Location (with map pin icon)
  - Hours worked
  - Overtime badge
  - Approval status

- **Notes Section:**
  - Displays any notes from specific entries
  - Organized by date

- **Footer Stats:**
  - Shows approved vs total entries
  - Export functionality

**Actions:**
- Close dialog
- Export timesheet data

---

## User Experience Features

### Visual Design
✅ **Consistent Layout:** All dialogs follow the same design pattern
✅ **Color Coding:** 
  - Green for positive actions (approve, active, on-time)
  - Red for negative actions (reject, inactive)
  - Yellow for warnings (overtime, alerts)
  - Blue for primary actions

✅ **Icons:** Every action has a relevant icon for better recognition
✅ **Responsive:** All dialogs work on mobile and desktop

### Interactive Elements
✅ **Loading States:** Buttons show spinner during async operations
✅ **Form Validation:** Real-time validation with clear error messages
✅ **Toast Notifications:** Success/error messages for all actions
✅ **Keyboard Support:** ESC to close, Tab navigation, Enter to submit

### Accessibility
✅ **Screen Reader Support:** ARIA labels on all elements
✅ **Keyboard Navigation:** Full keyboard accessibility
✅ **High Contrast:** Works with dark mode
✅ **Focus Management:** Proper focus handling

---

## Dialog Interactions by Role

### Employee
- **View Timesheet Details:** See complete week breakdown with hours and status
- Can see their own performance metrics
- Export personal timesheet data

### Manager
- **Review Approvals:** Full approval workflow with two-step process
- Can approve or reject with notes
- Overtime warnings help ensure compliance
- Bulk actions available on main page

### HR
- All employee management features
- Can view any employee's full details
- Access to performance and attendance metrics

### Admin
- **Full Employee Management:**
  - View complete employee profiles
  - Add new employees with comprehensive form
  - Edit existing employee data
  - Access to all employee metrics

- **Employee Details:**
  - Three-tab interface with overview, time records, and performance
  - Quick stats: hours this week/month, attendance rate
  - Recent time entry history
  - Monthly performance metrics

---

## Toast Notifications

All actions trigger appropriate feedback:

**Success Messages:**
- ✅ "Employee added successfully!"
- ✅ "Employee updated successfully!"
- ✅ "Time entry approved successfully!"

**Error Messages:**
- ❌ "Time entry rejected"
- ❌ "Failed to save employee"

**Positioning:** Bottom right corner (non-intrusive)
**Duration:** 3-5 seconds (auto-dismiss)
**Dismissible:** Click X to close manually

---

## Technical Implementation

### Dialog Components
All dialogs are built using ShadCN UI Dialog components for consistency:

```
/components/dialogs/
├── EmployeeDetailsDialog.tsx       - Employee profile view
├── AddEditEmployeeDialog.tsx       - Add/edit employee form
├── ApprovalDialog.tsx              - Time entry approval
└── TimesheetDetailsDialog.tsx      - Timesheet breakdown
```

### Key Libraries
- **Dialog System:** ShadCN Dialog component
- **Forms:** Native form elements with validation
- **Notifications:** Sonner toast library
- **Icons:** Lucide React

### State Management
- Local state with React useState
- Controlled components for forms
- Parent-child communication via props

---

## Usage Examples

### Admin - View Employee
1. Navigate to Admin Dashboard
2. Click "All Employees" in sidebar
3. Find employee in table
4. Click "View" button
5. Dialog opens with full employee details
6. Switch between Overview, Time Records, Performance tabs
7. Click "Edit Employee" to modify details
8. Click "Close" to dismiss

### Admin - Add Employee
1. Navigate to Admin Dashboard
2. Click "Add Employee" button (top right)
3. Fill in required fields (marked with *)
4. Select department, role, and type
5. Click "Add Employee"
6. Loading spinner appears
7. Toast confirms success
8. Dialog auto-closes

### Manager - Approve Entry
1. Navigate to Manager Dashboard
2. Click "Approvals" in sidebar
3. Find pending entry
4. Click "Review" button
5. Dialog opens with entry details
6. Review overtime warning if applicable
7. Click "Approve" or "Reject"
8. Add notes (required for rejection)
9. Click "Confirm"
10. Toast confirms action
11. Dialog closes

### Employee - View Timesheet
1. Navigate to Employee Dashboard
2. Click "My Timesheet" in sidebar
3. Click "View Details" button
4. Dialog opens with week summary
5. See total, regular, and overtime hours
6. Review detailed time entries
7. Check approval status for each entry
8. Click "Export" to download
9. Click "Close" to dismiss

---

## Best Practices

### For Users
1. **Always review details** before approving/rejecting
2. **Add notes** to provide context for decisions
3. **Check overtime warnings** before approving
4. **Verify employee information** when adding new employees
5. **Use export features** to keep personal records

### For Administrators
1. **Regular audits** - Review employee details periodically
2. **Complete profiles** - Ensure all employee info is filled
3. **Monitor approvals** - Check rejection reasons
4. **Data validation** - Verify information accuracy

---

## Future Enhancements

Planned improvements:
- Batch approval dialog for multiple entries
- Advanced filtering in employee details
- Printable timesheet views
- Email notifications integration
- Audit trail in dialogs
- Photo upload for employee profiles
- Document attachments
- Schedule preview in employee details

---

## Support

If you encounter issues with dialogs:
1. Try refreshing the page
2. Clear browser cache
3. Check browser console for errors
4. Contact IT Support: support@timemanager.com

**Browser Compatibility:**
- Chrome/Edge: Fully supported
- Firefox: Fully supported
- Safari: Fully supported
- Mobile browsers: Optimized for touch

---

**Remember:** All dialogs are non-blocking and can be closed at any time with the Close button or ESC key!
