# API Testing Guide - Food Donation System

This guide provides examples for testing all API endpoints using Postman or cURL.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <TOKEN>
```

---

## 1. Authentication Endpoints

### Register a New User

**Endpoint**: `POST /auth/register`

**Request**:
```json
{
  "username": "john_donor",
  "email": "john@example.com",
  "password": "password123",
  "role": "donor"
}
```

**Success Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_donor",
    "email": "john@example.com",
    "role": "donor"
  }
}
```

**Error Response** (400):
```json
{
  "message": "Email already exists"
}
```

---

### Login

**Endpoint**: `POST /auth/login`

**Request**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_donor",
    "email": "john@example.com",
    "role": "donor"
  }
}
```

**Error Response** (401):
```json
{
  "message": "Invalid credentials"
}
```

---

## 2. Donation Endpoints (Donors)

### Create a Food Donation

**Endpoint**: `POST /api/donations`

**Headers**:
```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

**Request**:
```json
{
  "foodName": "Rice",
  "quantity": "50 kg",
  "location": "Downtown Market"
}
```

**Success Response** (201):
```json
{
  "_id": "607f1f77bcf86cd799439012",
  "foodName": "Rice",
  "quantity": "50 kg",
  "location": "Downtown Market",
  "donorId": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_donor"
  },
  "status": "Pending",
  "createdAt": "2024-04-20T10:30:00.000Z"
}
```

**Error Response** (400):
```json
{
  "message": "All fields are required"
}
```

---

### Get All Donations

**Endpoint**: `GET /api/donations`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Success Response** (200):
```json
[
  {
    "_id": "607f1f77bcf86cd799439012",
    "foodName": "Rice",
    "quantity": "50 kg",
    "location": "Downtown Market",
    "donorId": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_donor"
    },
    "status": "Pending",
    "createdAt": "2024-04-20T10:30:00.000Z"
  },
  {
    "_id": "607f1f77bcf86cd799439013",
    "foodName": "Vegetables",
    "quantity": "30 kg",
    "location": "Suburb Area",
    "donorId": {
      "_id": "507f1f77bcf86cd799439014",
      "username": "jane_donor"
    },
    "status": "Picked",
    "createdAt": "2024-04-19T15:45:00.000Z"
  }
]
```

---

### Get Specific Donation

**Endpoint**: `GET /api/donations/:id`

**Example**: `GET /api/donations/607f1f77bcf86cd799439012`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Success Response** (200):
```json
{
  "_id": "607f1f77bcf86cd799439012",
  "foodName": "Rice",
  "quantity": "50 kg",
  "location": "Downtown Market",
  "donorId": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_donor"
  },
  "status": "Pending",
  "createdAt": "2024-04-20T10:30:00.000Z"
}
```

---

### Update Donation

**Endpoint**: `PUT /api/donations/:id`

**Example**: `PUT /api/donations/607f1f77bcf86cd799439012`

**Headers**:
```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

**Request**:
```json
{
  "foodName": "Rice",
  "quantity": "45 kg",
  "location": "Downtown Market",
  "status": "Picked"
}
```

**Success Response** (200):
```json
{
  "_id": "607f1f77bcf86cd799439012",
  "foodName": "Rice",
  "quantity": "45 kg",
  "location": "Downtown Market",
  "donorId": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_donor"
  },
  "status": "Picked",
  "updatedAt": "2024-04-20T11:00:00.000Z"
}
```

---

### Delete Donation

**Endpoint**: `DELETE /api/donations/:id`

**Example**: `DELETE /api/donations/607f1f77bcf86cd799439012`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Success Response** (200):
```json
{
  "message": "Donation deleted successfully"
}
```

---

## 3. Request Endpoints (NGOs)

### Create a Food Request

**Endpoint**: `POST /api/requests`

**Headers**:
```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

**Request**:
```json
{
  "donationId": "607f1f77bcf86cd799439012",
  "quantity": "30 kg"
}
```

**Success Response** (201):
```json
{
  "_id": "607f1f77bcf86cd799439015",
  "donationId": {
    "_id": "607f1f77bcf86cd799439012",
    "foodName": "Rice",
    "quantity": "50 kg"
  },
  "ngoId": {
    "_id": "507f1f77bcf86cd799439016",
    "username": "ngo_helper",
    "role": "ngo"
  },
  "requestedQuantity": "30 kg",
  "status": "Pending",
  "createdAt": "2024-04-20T12:00:00.000Z"
}
```

**Error Response** (400):
```json
{
  "message": "Donation not found or already assigned"
}
```

---

### Get All Requests (Admin/View)

**Endpoint**: `GET /api/requests`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Success Response** (200):
```json
[
  {
    "_id": "607f1f77bcf86cd799439015",
    "donationId": {
      "_id": "607f1f77bcf86cd799439012",
      "foodName": "Rice"
    },
    "ngoId": {
      "_id": "507f1f77bcf86cd799439016",
      "username": "ngo_helper"
    },
    "requestedQuantity": "30 kg",
    "status": "Pending",
    "createdAt": "2024-04-20T12:00:00.000Z"
  }
]
```

---

### Get User's Requests

**Endpoint**: `GET /api/requests/my-requests`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Success Response** (200):
```json
[
  {
    "_id": "607f1f77bcf86cd799439015",
    "donationId": {
      "_id": "607f1f77bcf86cd799439012",
      "foodName": "Rice",
      "location": "Downtown Market"
    },
    "ngoId": {
      "_id": "507f1f77bcf86cd799439016",
      "username": "ngo_helper"
    },
    "requestedQuantity": "30 kg",
    "status": "Pending",
    "createdAt": "2024-04-20T12:00:00.000Z"
  }
]
```

---

### Update Request Status

**Endpoint**: `PUT /api/requests/:id`

**Example**: `PUT /api/requests/607f1f77bcf86cd799439015`

**Headers**:
```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

**Request**:
```json
{
  "status": "Picked"
}
```

**Valid Status Values**: `Pending`, `Picked`, `Delivered`

**Success Response** (200):
```json
{
  "_id": "607f1f77bcf86cd799439015",
  "donationId": {
    "_id": "607f1f77bcf86cd799439012",
    "foodName": "Rice"
  },
  "ngoId": {
    "_id": "507f1f77bcf86cd799439016",
    "username": "ngo_helper"
  },
  "requestedQuantity": "30 kg",
  "status": "Picked",
  "updatedAt": "2024-04-20T13:30:00.000Z"
}
```

---

## Testing Workflow

### 1. Register Test Accounts

```bash
# Register as Donor
POST /auth/register
{
  "username": "test_donor",
  "email": "donor@test.com",
  "password": "test123",
  "role": "donor"
}

# Register as NGO
POST /auth/register
{
  "username": "test_ngo",
  "email": "ngo@test.com",
  "password": "test123",
  "role": "ngo"
}
```

### 2. Get Tokens

Save the tokens returned from registration responses.

### 3. Test Donation Flow (Use Donor Token)

```bash
# Create donation
POST /donations
{
  "foodName": "Rice",
  "quantity": "50 kg",
  "location": "Test Location"
}

# Get all donations
GET /donations

# Get specific donation (use ID from create)
GET /donations/{id}
```

### 4. Test Request Flow (Use NGO Token)

```bash
# Create request (use donation ID from step 3)
POST /requests
{
  "donationId": "{donation_id}",
  "quantity": "30 kg"
}

# Get my requests
GET /requests/my-requests

# Update request status
PUT /requests/{request_id}
{
  "status": "Picked"
}
```

---

## cURL Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123",
    "role": "donor"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Donation (with token)
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "foodName": "Rice",
    "quantity": "50 kg",
    "location": "Downtown"
  }'
```

### Get All Donations
```bash
curl -X GET http://localhost:5000/api/donations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Request
```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "donationId": "DONATION_ID",
    "quantity": "30 kg"
  }'
```

---

## Error Codes Reference

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | - |
| 201 | Created | - |
| 400 | Bad Request | Check request format and required fields |
| 401 | Unauthorized | Check/refresh token, login again |
| 403 | Forbidden | User doesn't have permission for this action |
| 404 | Not Found | Check resource ID |
| 500 | Server Error | Check backend logs |

---

## Common Issues

### "Invalid Token"
- Token might be expired
- Try logging in again
- Make sure token format is correct: `Bearer <token>`

### "Donation Not Found"
- Check if donation ID is correct
- Donation might have been deleted
- Try getting all donations first

### "CORS Error"
- Backend CORS is not configured
- Frontend and backend URLs might be wrong
- Check baseURL in axios config

### "Connection Refused"
- Backend is not running
- Backend is on wrong port (should be 5000)
- MongoDB might not be running

---

## Testing Checklist

- [ ] Register as Donor
- [ ] Register as NGO
- [ ] Login as Donor
- [ ] Login as NGO
- [ ] Create donation (as Donor)
- [ ] View all donations (as NGO)
- [ ] Request food (as NGO)
- [ ] Update donation status (as Donor)
- [ ] Update request status (as Donor)
- [ ] Get my requests (as NGO)

---

## Frontend Integration Testing

The frontend automatically:
- Stores tokens in localStorage
- Attaches tokens to all API requests
- Handles 401 errors by redirecting to login
- Shows error messages from API responses
- Displays success messages on successful operations

All these endpoints have been tested and integrated with the React frontend!
