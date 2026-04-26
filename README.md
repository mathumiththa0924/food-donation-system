# Food Donation System - Documentation Index

Welcome! Here's a guide to all the documentation files to help you understand and use the system.

## 📚 Documentation Files

### Root Level Documentation

1. **[GETTING_STARTED.md](./GETTING_STARTED.md)** ⭐ START HERE
   - Quick start guide to get the entire system running
   - Step-by-step installation instructions
   - How to use the application
   - Troubleshooting tips
   - **Best for**: First-time setup, installation help

2. **[FRONTEND_OVERVIEW.md](./FRONTEND_OVERVIEW.md)**
   - Complete technical overview of the frontend architecture
   - Detailed explanation of all components
   - Data flow diagrams and architecture patterns
   - Performance considerations
   - **Best for**: Understanding how the frontend works internally

3. **[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)**
   - Complete API endpoint documentation
   - Request/response examples
   - cURL examples for testing
   - Testing workflow and checklist
   - Common issues and solutions
   - **Best for**: Testing APIs, debugging integration issues

### Frontend Documentation

4. **[frontend/README.md](./frontend/README.md)**
   - Frontend features overview
   - Project structure explained
   - Installation steps for frontend only
   - Technologies used
   - Authentication flow
   - **Best for**: Frontend-specific details, setup, dependencies

### Backend Documentation

5. **[backend/README.md](./backend/README.md)** (if available)
   - Backend setup instructions
   - Database schema
   - Server configuration
   - **Best for**: Backend developers

---

## 🚀 Getting Started Roadmap

### For First-Time Users
1. Read **GETTING_STARTED.md** completely
2. Follow the installation steps exactly
3. Open the application at http://localhost:3000
4. Create test accounts (one Donor, one NGO)
5. Test the features

### For Understanding the System
1. Read **GETTING_STARTED.md** for overview
2. Read **FRONTEND_OVERVIEW.md** for architecture details
3. Read **API_TESTING_GUIDE.md** for API details
4. Explore the code in the IDE

### For API Integration/Testing
1. Read **API_TESTING_GUIDE.md** for endpoints
2. Use Postman or cURL to test endpoints
3. Refer to examples provided
4. Check status codes and error messages

### For Frontend Development
1. Read **frontend/README.md** for structure
2. Read **FRONTEND_OVERVIEW.md** for architecture
3. Explore components in `src/` folder
4. Study the service layer in `src/services/`

---

## 📋 Quick Reference

### Project Structure
```
food-donation-system/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API services
│   │   ├── context/      # React Context
│   │   ├── hooks/        # Custom hooks
│   │   └── styles/       # CSS files
│   └── README.md         # Frontend docs
│
├── backend/              # Node.js backend
│   ├── models/          # Database models
│   ├── controllers/     # Route handlers
│   ├── routes/          # API routes
│   └── README.md        # Backend docs
│
├── GETTING_STARTED.md   # Quick start guide
├── FRONTEND_OVERVIEW.md # Frontend architecture
└── API_TESTING_GUIDE.md # API documentation
```

### Important URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **MongoDB**: mongodb://localhost:27017

### Key Commands

```bash
# Frontend setup
cd frontend
npm install
npm start

# Backend setup
cd backend
npm install
npm start

# Testing in Postman
Import the endpoints from API_TESTING_GUIDE.md
```

---

## 🎯 Feature Overview

### Donor Features
- ✅ Register with Donor role
- ✅ Add food donations
- ✅ Specify food details (name, quantity, location)
- ✅ Track donation status
- ✅ View requests from NGOs

### NGO Features
- ✅ Register with NGO role
- ✅ View all available donations
- ✅ Request food from donors
- ✅ Track request status
- ✅ See pickup locations

### Authentication
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Auto-logout on token expiration
- ✅ Secure token storage

---

## 🔍 Finding Answers

### "How do I set up the system?"
→ Read **GETTING_STARTED.md**

### "How does the frontend work?"
→ Read **FRONTEND_OVERVIEW.md**

### "How do I test the APIs?"
→ Read **API_TESTING_GUIDE.md**

### "What files do I need to edit for frontend changes?"
→ Look in **frontend/src/** and read **FRONTEND_OVERVIEW.md**

### "Where is the Login component?"
→ **frontend/src/pages/Login.js**

### "How is the user state managed?"
→ Check **frontend/src/context/AuthContext.js**

### "How do API requests work?"
→ Check **frontend/src/services/** files

### "Where is the donation form?"
→ **frontend/src/components/AddFoodForm.js**

### "How do I add a new feature?"
→ Create component in **frontend/src/components/**

### "How do I call an API?"
→ Use services from **frontend/src/services/**

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"
- Solution in: **GETTING_STARTED.md** → Troubleshooting section

### Issue: "CORS Error"
- Solution in: **GETTING_STARTED.md** → Troubleshooting section

### Issue: "401 Unauthorized"
- Solution in: **API_TESTING_GUIDE.md** → Error Codes section

### Issue: Port already in use
- Solution in: **GETTING_STARTED.md** → Troubleshooting section

### Issue: API not responding
- Check: **API_TESTING_GUIDE.md** → Testing Workflow section

---

## 📝 File Purposes at a Glance

| File | Purpose | Read If |
|------|---------|---------|
| GETTING_STARTED.md | System setup guide | Setting up the project |
| FRONTEND_OVERVIEW.md | Architecture details | Understanding the code |
| API_TESTING_GUIDE.md | API documentation | Testing APIs |
| frontend/README.md | Frontend details | Working on frontend |
| frontend/src/App.js | Main routing logic | Changing routes |
| frontend/src/context/AuthContext.js | Auth state | Understanding auth |
| frontend/src/services/ | API calls | Making API requests |
| frontend/src/pages/ | Page components | Creating new pages |
| frontend/src/components/ | Reusable components | Creating components |

---

## 🎓 Learning Path

### Beginner (Just want to use it)
1. GETTING_STARTED.md
2. Install and run locally
3. Test the features

### Intermediate (Want to modify it)
1. GETTING_STARTED.md
2. FRONTEND_OVERVIEW.md
3. API_TESTING_GUIDE.md
4. Explore the code

### Advanced (Want to extend it)
1. All of the above
2. Study each component in detail
3. Understand the service layer
4. Add new features

---

## 🔗 Related Resources

### External Documentation
- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [MongoDB Documentation](https://docs.mongodb.com)

### Tools Needed
- Node.js & npm
- MongoDB
- Code Editor (VS Code recommended)
- Postman (for API testing)

---

## ❓ FAQ

**Q: Where do I start?**
A: Read GETTING_STARTED.md first!

**Q: How do I test the APIs?**
A: Read API_TESTING_GUIDE.md and use Postman

**Q: How do I add a new page?**
A: Create it in frontend/src/pages/, add route in App.js

**Q: How do I call an API?**
A: Use the services from frontend/src/services/

**Q: How is the user logged in state maintained?**
A: Using AuthContext in frontend/src/context/

**Q: Where is the API error handling?**
A: In frontend/src/services/api.js (axios interceptors)

**Q: How do I prevent unauthorized access?**
A: PrivateRoute component checks authentication

**Q: Can I modify the styling?**
A: Yes! CSS files are in frontend/src/styles/

---

## 📞 Support

If you're stuck:
1. Check the Troubleshooting section in GETTING_STARTED.md
2. Check the Error Codes in API_TESTING_GUIDE.md
3. Read FRONTEND_OVERVIEW.md for architecture understanding
4. Check browser console for error messages
5. Check backend terminal for server logs

---

## ✅ Verification Checklist

- [ ] I've read GETTING_STARTED.md
- [ ] I have Node.js and MongoDB installed
- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] I can register a new account
- [ ] I can log in
- [ ] I can see the appropriate dashboard (Donor or NGO)
- [ ] I can create a donation (as Donor)
- [ ] I can view donations (as NGO)
- [ ] I can request food (as NGO)

---

## 🎉 You're Ready!

All documentation is in place. Follow GETTING_STARTED.md and you'll have the system running in no time!

Good luck! 🚀
