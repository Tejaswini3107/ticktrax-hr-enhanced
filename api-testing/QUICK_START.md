# Quick Start - API Testing

Get up and running with the Ticktrax API in under 5 minutes!

## 🚀 1-Minute Setup

### Step 1: Import into Postman
1. Open Postman
2. Click **Import** → Select both JSON files
3. Select **Gotham Time Manager Environment** from dropdown (top-right)

### Step 2: Start Backend
```bash
# Make sure your backend API is running on:
http://localhost:4000/api
```

### Step 3: Test Authentication
1. Open **🔐 Authentication** folder
2. Click **Login** request
3. Update email/password if needed
4. Click **Send**
5. ✅ JWT token auto-saves!

**You're ready to test!** 🎉

---

## 🎯 Common Test Scenarios

### Scenario 1: Employee Time Tracking
```
1. Login → POST /auth/login
2. Clock In → POST /time/clock-in
3. Start Break → POST /user/breaks/start
4. End Break → POST /user/breaks/end
5. Clock Out → POST /time/clock-out
6. View Entries → GET /time/entries
```

### Scenario 2: Manager Approvals
```
1. Login (as manager) → POST /auth/login
2. Get Pending → GET /approvals/pending
3. Approve → PUT /approvals/:entry_id/approve
4. View History → GET /approvals/history
```

### Scenario 3: Admin Management
```
1. Login (as admin) → POST /auth/login
2. Create User → POST /users
3. Create Team → POST /teams
4. Assign Manager → PUT /teams/:team_id/assign_manager
5. View Analytics → GET /analytics/overview
```

---

## 🔑 Quick Reference

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login (auto-saves token) |
| `/auth/me` | GET | Get current user |
| `/auth/logout` | POST | Logout |

### Time Tracking (Top 5)
| Endpoint | Method | Body Required |
|----------|--------|---------------|
| `/time/clock-in` | POST | ✅ Location data |
| `/time/clock-out` | POST | ✅ Location data |
| `/time/status` | GET | ❌ |
| `/time/entries` | GET | ❌ |
| `/time/manual-entry` | POST | ✅ Times & notes |

### Breaks
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/user/breaks/start` | POST | Start break |
| `/user/breaks/end` | POST | End break |
| `/user/breaks/status` | GET | Current status |
| `/user/breaks/history` | GET | Break history |

---

## 💡 Pro Tips

### Tip 1: Auto-Variables
Environment variables auto-populate. Just use:
- `{{base_url}}` - API base URL
- `{{jwt_token}}` - Auth token (auto-saved after login)
- `{{user_id}}`, `{{team_id}}`, etc. - Sample IDs

### Tip 2: Path Variables
For endpoints like `/users/:user_id`, just replace `:user_id`:
```
{{base_url}}/users/{{user_id}}
```

### Tip 3: Pagination
Many endpoints support:
```
?page=1&limit=20&start_date=2025-10-01&end_date=2025-10-31
```

### Tip 4: Test Scripts
The Login request includes a test script that:
- Automatically extracts JWT token from response
- Saves it to environment variable
- All subsequent requests use it automatically

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Login first to get JWT token |
| 404 Not Found | Check if backend is running on `localhost:4000` |
| CORS Error | See CORS_SETUP_GUIDE.md |
| Token Expired | Run Login request again |

---

## 📦 Sample Request Bodies

### Register User
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "password123",
  "role_id": 1
}
```

### Clock In
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "work_location": "Office"
}
```

### Start Break
```json
{
  "break_type": "regular"
}
```

### Manual Time Entry
```json
{
  "clock_in": "2025-10-12T09:00:00Z",
  "clock_out": "2025-10-12T17:00:00Z",
  "work_location": "Home Office",
  "notes": "Forgot to clock in"
}
```

---

## 🎓 Next Steps

- ✅ Test all 87 endpoints
- ✅ Create custom test scenarios
- ✅ Add your own environment variables
- ✅ Export and share with team

📖 **Full Documentation**: [README.md](./README.md)

---

**Happy Testing!** 🚀

