# Backend API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://career-path-backend-weld.vercel.app/api`

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "level": "12th Standard",
  "stream": "Science",
  "course": "B.Tech",
  "branch": "Computer Science",
  "semester": "2",
  "clerkId": "user_3CaGKXKtD9BXQ7idhy10MqqqUWm"
}
```

**Response (201):**
```json
{
  "_id": 1,
  "clerkId": "user_3CaGKXKtD9BXQ7idhy10MqqqUWm",
  "name": "John Doe",
  "email": "john@example.com",
  "level": "12th Standard",
  "stream": "Science",
  "course": "B.Tech",
  "branch": "Computer Science",
  "semester": "2",
  "token": "eyJhbGc..."
}
```

**Errors:**
- `400`: Name, email, and password required
- `400`: Password must be at least 6 characters
- `400`: Invalid email format
- `400`: User already exists

---

### 2. Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "_id": 1,
  "clerkId": "user_3CaGKXKtD9BXQ7idhy10MqqqUWm",
  "name": "John Doe",
  "email": "john@example.com",
  "level": "12th Standard",
  "stream": "Science",
  "course": "B.Tech",
  "branch": "Computer Science",
  "semester": "2",
  "token": "eyJhbGc..."
}
```

**Errors:**
- `400`: Email and password required
- `401`: Invalid email or password

---

### 3. Update Profile
**PUT** `/auth/profile`

**Request Body:**
```json
{
  "userId": 1,
  "level": "12th Standard",
  "stream": "Science",
  "course": "B.Tech",
  "branch": "Computer Science",
  "semester": "4"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "level": "12th Standard",
  "stream": "Science",
  "course": "B.Tech",
  "branch": "Computer Science",
  "semester": "4"
}
```

**Errors:**
- `400`: User ID is required
- `404`: User not found

---

## Assessment Endpoints

### 4. Generate Questions
**POST** `/test/generate-questions`

**Request Body:**
```json
{
  "level": "12th Standard",
  "stream": "Science",
  "course": "B.Tech",
  "branch": "Computer Science",
  "semester": "2"
}
```

**Response (200):**
```json
{
  "questions": [
    {
      "questionText": "What interests you most?",
      "options": [
        { "text": "Building software", "score": { "Technology": 10, "Analytical": 5 } },
        { "text": "Teaching others", "score": { "Social": 10, "Management": 5 } }
      ]
    }
  ]
}
```

---

### 5. Calculate Results & Get Career Recommendations
**POST** `/result/calculate`

**Request Body:**
```json
{
  "scores": {
    "Technology": 45,
    "Analytical": 38,
    "Management": 25,
    "Creative": 30,
    "Social": 20,
    "Research": 35
  },
  "responses": [
    { "question": "What interests you?", "answer": "Building software" }
  ],
  "level": "12th Standard",
  "stream": "Science",
  "course": "B.Tech",
  "branch": "Computer Science",
  "semester": "2",
  "userId": "user_3CaGKXKtD9BXQ7idhy10MqqqUWm"
}
```

**Response (200):**
```json
{
  "topMatches": [
    {
      "title": "Software Engineer",
      "matchPercentage": 92,
      "description": "Design and build software systems",
      "reason": "High Technology and Analytical scores",
      "roadmap": [
        { "step": "Phase 1: Learn programming fundamentals", "action": "Master Python/JavaScript basics" },
        { "step": "Phase 2: Build projects", "action": "Create 3-4 portfolio projects" },
        { "step": "Phase 3: Internships", "action": "Apply for tech internships" },
        { "step": "Phase 4: Entry level job", "action": "Target junior developer roles" }
      ]
    }
  ]
}
```

---

### 6. Get Assessment History
**GET** `/result/:userId`

**Response (200):**
```json
[
  {
    "topMatches": [...],
    "date": "2024-04-20T10:30:00Z",
    "scores": { "Technology": 45, ... }
  }
]
```

**Errors:**
- `404`: User not found

---

## Health Check
**GET** `/health`

**Response (200):**
```json
{
  "status": "OK"
}
```

---

## Error Handling

All errors follow this format:
```json
{
  "message": "Error description"
}
```

**Common Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

---

## Notes

- All timestamps are in ISO 8601 format
- Tokens expire in 30 days
- Passwords are hashed using bcrypt
- Maximum request body size: 100KB
