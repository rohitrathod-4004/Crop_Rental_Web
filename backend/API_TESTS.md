# Authentication API Testing

## Base URL
```
http://localhost:5000/api/auth
```

---

## 1. Register Farmer

### Request
```http
POST {{baseUrl}}/register
Content-Type: application/json

{
  "name": "Ramesh Kumar",
  "email": "ramesh@example.com",
  "phone": "9876543210",
  "password": "Password123",
  "role": "FARMER",
  "location": {
    "lat": 18.5204,
    "lng": 73.8567,
    "address": "Pune, Maharashtra"
  }
}
```

---

## 2. Register Owner

### Request
```http
POST {{baseUrl}}/register
Content-Type: application/json

{
  "name": "Suresh Patil",
  "email": "suresh@example.com",
  "phone": "9123456789",
  "password": "SecurePass123",
  "role": "OWNER"
}
```

---

## 3. Register Admin

### Request
```http
POST {{baseUrl}}/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "phone": "9999999999",
  "password": "AdminPass123",
  "role": "ADMIN"
}
```

---

## 4. Login

### Request
```http
POST {{baseUrl}}/login
Content-Type: application/json

{
  "email": "ramesh@example.com",
  "password": "Password123"
}
```

### Save Token
After successful login, copy the token from response and use it in subsequent requests.

---

## 5. Get Current User

### Request
```http
GET {{baseUrl}}/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 6. Update Profile

### Request
```http
PUT {{baseUrl}}/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Ramesh Kumar Sharma",
  "phone": "9876543211",
  "location": {
    "lat": 18.5204,
    "lng": 73.8567,
    "address": "Pune, Maharashtra, India"
  }
}
```

---

## Error Test Cases

### 1. Register with Existing Email
```http
POST {{baseUrl}}/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "ramesh@example.com",
  "phone": "9111111111",
  "password": "Password123",
  "role": "FARMER"
}
```
**Expected:** 409 Conflict

---

### 2. Login with Invalid Credentials
```http
POST {{baseUrl}}/login
Content-Type: application/json

{
  "email": "ramesh@example.com",
  "password": "WrongPassword"
}
```
**Expected:** 401 Unauthorized

---

### 3. Access Protected Route Without Token
```http
GET {{baseUrl}}/me
```
**Expected:** 401 Unauthorized

---

### 4. Access Protected Route With Invalid Token
```http
GET {{baseUrl}}/me
Authorization: Bearer invalid_token_here
```
**Expected:** 401 Unauthorized
