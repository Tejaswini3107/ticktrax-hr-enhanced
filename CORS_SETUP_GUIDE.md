# CORS Configuration Guide for Backend

## 🚫 Current Issue
Your frontend (running on `localhost:3001`) cannot communicate with your backend (running on `localhost:4000`) due to CORS (Cross-Origin Resource Sharing) restrictions.

**Frontend URL**: `http://localhost:3001`  
**Backend URL**: `http://localhost:4000`

## 🔧 Backend CORS Configuration

### For Phoenix/Elixir (Your Backend)

Add CORS configuration to your Phoenix application:

1. **Add CORS dependency** to `mix.exs`:
```elixir
defp deps do
  [
    # ... other dependencies
    {:cors_plug, "~> 3.0"}
  ]
end
```

2. **Configure CORS** in `lib/gotham_time_manager_web/endpoint.ex`:
```elixir
defmodule GothamTimeManagerWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :gotham_time_manager

  # Add CORS plug - IMPORTANT: Use specific origins, not wildcard
  plug CORSPlug,
    origin: ["http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3000", "http://127.0.0.1:3000"],
    max_age: 86400,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    headers: ["Content-Type", "Authorization", "x-csrf-token"],
    credentials: true  # This is crucial for credentials: 'include'

  # ... rest of your endpoint configuration
end
```

3. **Alternative: Configure in router** `lib/gotham_time_manager_web/router.ex`:
```elixir
defmodule GothamTimeManagerWeb.Router do
  use GothamTimeManagerWeb, :router

  # Add CORS pipeline - IMPORTANT: Use specific origins, not wildcard
  pipeline :cors do
    plug CORSPlug,
      origin: ["http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3000", "http://127.0.0.1:3000"],
      max_age: 86400,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      headers: ["Content-Type", "Authorization", "x-csrf-token"],
      credentials: true  # This is crucial for credentials: 'include'
  end

  scope "/api", GothamTimeManagerWeb do
    pipe_through [:cors, :api]
    
    # Your existing routes
    get "/me", AuthController, :me
    post "/auth/login", AuthController, :login
    get "/auth/csrf-token", AuthController, :csrf_token  # Make sure this route exists
    # ... other routes
  end
end
```

4. **Run mix deps.get** to install the dependency:
```bash
mix deps.get
```

5. **Restart your Phoenix server**:
```bash
mix phx.server
```

### For Ruby on Rails (if using Rails API)

Add this to your `config/application.rb`:

```ruby
config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:3000', 'http://127.0.0.1:3000'
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

### For Node.js/Express

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));
```

### For Python/Flask

```python
from flask_cors import CORS

CORS(app, 
     origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'x-csrf-token'])
```

### For Python/Django

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrf-token',
    'x-requested-with',
]
```

## 🎯 Required Headers

Your backend must include these headers in responses:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, x-csrf-token
```

## 🚨 Current Issues & Solutions

### **Issue 1: Wildcard Origin with Credentials**
**Error**: `The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'`

**Solution**: Use specific origins instead of `*`:
```elixir
# ❌ Wrong - causes the error
origin: "*"

# ✅ Correct - specific origins
origin: ["http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3000", "http://127.0.0.1:3000"]
```

### **Issue 2: Missing CSRF Token Route**
**Error**: `Failed to load resource: net::ERR_FAILED` for `/api/auth/csrf-token`

**Solution**: Make sure you have the CSRF token route in your router:
```elixir
# Add this route to your router
get "/auth/csrf-token", AuthController, :csrf_token
```

### **Issue 3: Missing Credentials Support**
**Error**: CORS preflight fails with credentials

**Solution**: Add `credentials: true` to your CORS configuration:
```elixir
plug CORSPlug,
  origin: ["http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,  # This is essential!
  # ... other options
```

## 🧪 Testing CORS

After configuring CORS, test with:

```bash
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:4000/api/login
```

## 🚀 Quick Fix for Development

If you want to temporarily disable CORS for development (NOT for production):

### Node.js/Express
```javascript
app.use(cors({
  origin: true,
  credentials: true
}));
```

### Ruby on Rails
```ruby
config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'
    resource '*', headers: :any, methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

## ✅ After CORS Configuration

1. Restart your backend server
2. Refresh your frontend application
3. Check browser console - CORS errors should be gone
4. Try logging in with demo accounts

## 🔍 Verification

You should see in the browser console:
```
🔍 Testing API connection...
✅ Backend API is reachable
🔐 Testing authentication endpoints...
Login endpoint status: 400 (expected for test credentials)
```

Instead of CORS errors.

## 📝 Notes

- The frontend is configured to work with or without the backend
- Demo mode will work regardless of CORS issues
- Once CORS is fixed, real authentication will work seamlessly
