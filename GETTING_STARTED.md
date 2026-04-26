# Food Donation System - Quick Start Guide

This guide will help you get the entire MERN Food Donation System up and running.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│              http://localhost:3000                          │
│  - Login/Register with role selection                       │
│  - Donor Dashboard (add food donations)                     │
│  - NGO Dashboard (view & request donations)                 │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
                     Axios HTTP Client
                   (JWT Token Attached)
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js/Express)                  │
│              http://localhost:5000/api                      │
│  - Authentication endpoints                                 │
│  - Donation management                                      │
│  - Request handling                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                 Database (MongoDB)                          │
│          mongodb://localhost:27017                          │
│  - Users collection (Donors & NGOs)                         │
│  - Food donations collection                                │
│  - Requests collection                                      │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (running locally on port 27017)

## Installation & Running

### Step 1: Start MongoDB

Make sure MongoDB is running on your machine:

**Windows:**
```bash
mongod
```

**macOS (if installed via Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo service mongod start
```

Verify MongoDB is running:
```bash
mongo
> exit
```

---

### Step 2: Setup Backend

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

Start the backend server:

```bash
npm start
```

Expected output:
```
Server is running on port 5000
Database connected
```

The backend API will be available at: **http://localhost:5000/api**

---

### Step 3: Setup Frontend

In a new terminal, navigate to the frontend folder and install dependencies:

```bash
cd frontend
npm install
```

Start the React development server:

```bash
npm start
```

The browser will automatically open at: **http://localhost:3000**

---

## Using the Application

### 1. Register a New Account

Navigate to the Register page:
- **URL**: http://localhost:3000/register
- Fill in the form:
  - Username
  - Email
  - Password
  - Confirm Password
  - Select Role: **Donor** or **NGO**
- Click "Register"

### 2. Login

Navigate to the Login page:
- **URL**: http://localhost:3000/login
- Enter your email and password
- Click "Login"

After successful login, you'll be redirected to:
- **Donor**: http://localhost:3000/donor
- **NGO**: http://localhost:3000/ngo

---

### 3. Donor Features

#### Add Food Donation

1. Go to Donor Dashboard
2. Click "Add Food Donation"
3. Fill in the form:
   - **Food Name**: e.g., "Rice", "Vegetables", "Cooked Meals"
   - **Quantity**: e.g., "10 kg", "50 portions"
   - **Location**: e.g., "Downtown", "Suburb Area"
4. Click "Add Donation"

**Status Tracking:**
- Pending: Food is available for pickup
- Picked: NGO has picked up the food
- Delivered: Food has been delivered to beneficiaries

---

### 4. NGO Features

#### View Available Donations

1. Go to NGO Dashboard
2. Browse all food donations from donors
3. See donation details:
   - Food name
   - Quantity available
   - Pickup location
   - Donor information
   - Current status

#### Request Food

1. Click "Request Food" on any donation card
2. Your request will be submitted to the donor
3. Donor will receive notification of your request
4. Track request status in your dashboard

**Status Flow:**
- Pending: Request awaiting donor approval
- Picked: Donor has picked up the food
- Delivered: Food delivered to your organization

---

## API Endpoints Reference

### Authentication
```
POST /api/auth/login
  Body: { email, password }
  Response: { token, user }

POST /api/auth/register
  Body: { username, email, password, role }
  Response: { token, user }
```

### Food Donations (Donors)
```
GET /api/donations
  Get all available donations

POST /api/donations
  Body: { foodName, quantity, location }
  Create new donation

PUT /api/donations/:id
  Update donation details

DELETE /api/donations/:id
  Delete a donation
```

### Food Requests (NGOs)
```
POST /api/requests
  Body: { donationId, quantity }
  Request food from donor

GET /api/requests
  Get all requests (admin view)

GET /api/requests/my-requests
  Get user's requests

PUT /api/requests/:id
  Body: { status }
  Update request status
```

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running
- Check that MongoDB is on port 27017
- On Windows, check if MongoDB service is started

### "CORS Error"
- Backend should be running on port 5000
- Frontend on port 3000
- Axios base URL should be http://localhost:5000/api

### "401 Unauthorized"
- Token might have expired
- Try logging out and logging back in
- Clear browser localStorage if needed

### "Cannot find module"
- Run `npm install` in the specific folder (frontend or backend)
- Delete node_modules and package-lock.json, then reinstall

### Port Already in Use
```bash
# Find and kill process using port 3000 (frontend)
lsof -i :3000
kill -9 <PID>

# Find and kill process using port 5000 (backend)
lsof -i :5000
kill -9 <PID>
```

---

## Project Structure

```
food-donation-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── server.js        # Main server file
│   └── package.json
│
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API services
│   │   ├── context/     # React Context
│   │   ├── hooks/       # Custom hooks
│   │   ├── styles/      # CSS files
│   │   └── App.js       # Main app component
│   └── package.json
│
└── docs/                # Documentation
```

---

## Development Tips

### Useful Tools
- **VS Code**: Recommended editor
- **MongoDB Compass**: GUI for MongoDB
- **Postman**: API testing tool
- **Redux DevTools**: For debugging state (if needed)

### Running Multiple Terminals
- Terminal 1: MongoDB (`mongod`)
- Terminal 2: Backend (`npm start` in backend folder)
- Terminal 3: Frontend (`npm start` in frontend folder)

### Testing the API
You can test API endpoints using Postman:
1. Set request method (GET, POST, PUT, DELETE)
2. Enter endpoint URL
3. Add Authorization header: `Bearer <YOUR_JWT_TOKEN>`
4. Set Body (JSON) for POST/PUT requests

---

## Common Features Explained

### JWT Token
- Automatically stored in localStorage after login
- Automatically attached to all API requests
- Automatically cleared on 401 error (token expiration)

### Role-Based Access
- **Donor role**: Can only access /donor route
- **NGO role**: Can only access /ngo route
- Unauthorized access redirects to login

### Status Tracking
- Tracks food donation lifecycle
- Pending → Picked → Delivered
- Status updated by donors or admins

---

## Next Steps / Enhancements

- [ ] Add image upload for food donations
- [ ] Implement real-time notifications
- [ ] Add review and rating system
- [ ] Map integration for location tracking
- [ ] Email notification system
- [ ] Advanced search and filtering
- [ ] Analytics dashboard
- [ ] Mobile app version

---

## Support & Help

For issues or questions:
1. Check the README.md files in each folder
2. Review API response messages
3. Check browser console for errors (F12)
4. Check backend terminal for logs

---

## License

This project is open source and available under the MIT License.

---

**Happy Coding! 🚀**

For more detailed information, see:
- `/frontend/README.md` - Frontend documentation
- `/backend/README.md` - Backend documentation (if available)
