# API Documentation

This document provides comprehensive details for all backend APIs used in the application, including authentication, habits, calendar, and assistant functionalities.

## Table of Contents

- [Authentication](#authentication)
- [Habit API](#habit-api)
- [Calendar API](#calendar-api)
- [Assistant API](#assistant-api)

## Authentication

### Login

**Endpoint:** `/auth/login`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "680f925734638c115e6cac6d", 
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

**Error Response:**
- **Code:** 401
- **Content:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Habit API

All Habit API endpoints require authentication via Bearer token.

### Get All Habits

**Endpoint:** `/habits`

**Method:** `GET`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Query Parameters (optional):**
- `tag`: Filter habits by tag

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "680fb2c94c8a69990f63f4ba",
      "name": "Morning Exercise",
      "description": "Exercise for 30 minutes every morning",
      "frequency": ["Monday", "Wednesday", "Friday"],
      "reminder": true,
      "reminderTime": "07:00",
      "tags": ["health", "exercise"],
      "userId": "680f925734638c115e6cac6d",
      "completedToday": true,
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T12:00:00.000Z"
    },
    {
      "_id": "680fb2c94c8a69990f63f4bb",
      "name": "Reading",
      "description": "Read for 1 hour",
      "frequency": ["daily"],
      "reminder": false,
      "tags": ["personal", "education"],
      "userId": "680f925734638c115e6cac6d",
      "completedToday": false,
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T12:00:00.000Z"
    }
  ]
}
```

**Error Response:**
- **Code:** 500
- **Content:**
```json
{
  "success": false,
  "message": "Failed to get habits"
}
```

### Create Habit

**Endpoint:** `/habits`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "name": "Morning Exercise",
  "description": "Exercise for 30 minutes every morning",
  "frequency": ["daily"],
  "reminder": true,
  "reminderTime": "07:00",
  "tags": ["health", "exercise"]
}
```

**Success Response:**
- **Code:** 201
- **Content:**
```json
{
  "success": true,
  "data": {
    "_id": "680fb2c94c8a69990f63f4ba",
    "name": "Morning Exercise",
    "description": "Exercise for 30 minutes every morning",
    "frequency": ["daily"],
    "reminder": true,
    "reminderTime": "07:00",
    "tags": ["health", "exercise"],
    "userId": "680f925734638c115e6cac6d",
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

**Error Response:**
- **Code:** 400
- **Content:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Name is required"]
}
```

### Get Habit Tags

**Endpoint:** `/habits/tags`

**Method:** `GET`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "data": [
    { "name": "health", "count": 3 },
    { "name": "work", "count": 2 },
    { "name": "personal", "count": 1 }
  ]
}
```

**Error Response:**
- **Code:** 500
- **Content:**
```json
{
  "success": false,
  "message": "Failed to get habit tags"
}
```

### Get Habit by ID

**Endpoint:** `/habits/{id}`

**Method:** `GET`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "data": {
    "_id": "680fb2c94c8a69990f63f4ba",
    "name": "Morning Exercise",
    "description": "Exercise for 30 minutes every morning",
    "frequency": ["daily"],
    "reminder": true,
    "reminderTime": "07:00",
    "tags": ["health", "exercise"],
    "userId": "680f925734638c115e6cac6d",
    "completedToday": true,
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

**Error Response:**
- **Code:** 404
- **Content:**
```json
{
  "success": false,
  "message": "Habit not found"
}
```

### Update Habit

**Endpoint:** `/habits/{id}`

**Method:** `PUT`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "name": "Updated Morning Exercise",
  "description": "Exercise for 45 minutes every morning",
  "tags": ["health", "exercise", "morning routine"]
}
```

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "data": {
    "_id": "680fb2c94c8a69990f63f4ba",
    "name": "Updated Morning Exercise",
    "description": "Exercise for 45 minutes every morning",
    "frequency": ["daily"],
    "reminder": true,
    "reminderTime": "07:00",
    "tags": ["health", "exercise", "morning routine"],
    "userId": "680f925734638c115e6cac6d",
    "completedToday": true,
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:30:00.000Z"
  }
}
```

**Error Response:**
- **Code:** 404
- **Content:**
```json
{
  "success": false,
  "message": "Habit not found"
}
```

### Delete Habit

**Endpoint:** `/habits/{id}`

**Method:** `DELETE`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response:**
- **Code:** 204
- **Content:** No content

**Error Response:**
- **Code:** 404
- **Content:**
```json
{
  "success": false,
  "message": "Habit not found"
}
```

### Complete Habit

**Endpoint:** `/habits/{id}/complete`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "date": "2023-01-01T00:00:00.000Z"
}
```
Note: The date field is optional. If not provided, the current date will be used.

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "data": {
    "completionCount": 1,
    "completedToday": true,
    "streak": 1
  }
}
```

**Error Response:**
- **Code:** 404
- **Content:**
```json
{
  "success": false,
  "message": "Habit not found"
}
```

### Uncomplete Habit

**Endpoint:** `/habits/{id}/uncomplete`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "date": "2023-01-01T00:00:00.000Z"
}
```
Note: The date field is optional. If not provided, the current date will be used.

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "data": {
    "completionCount": 0,
    "completedToday": false,
    "streak": 0
  }
}
```

**Error Response:**
- **Code:** 404
- **Content:**
```json
{
  "success": false,
  "message": "Habit not found"
}
```

## Calendar API

All Calendar API endpoints require authentication via Bearer token.

### Get All Calendar Tasks

**Endpoint:** `/calendar/tasks`

**Method:** `GET`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Query Parameters (optional):**
- `startDate`: ISO date string (e.g., "2023-01-01")
- `endDate`: ISO date string (e.g., "2023-01-31")

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "task-1745859273543",
      "title": "Team Meeting",
      "description": "Weekly team sync meeting",
      "startDate": "2023-01-02T10:00:00.000Z",
      "endDate": "2023-01-02T11:00:00.000Z",
      "isAllDay": false,
      "isRecurring": true,
      "recurrencePattern": "weekly",
      "priority": "high",
      "tags": ["work", "meeting"],
      "userId": "680f925734638c115e6cac6d",
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T12:00:00.000Z"
    },
    {
      "_id": "task-1745859273544",
      "title": "Doctor Appointment",
      "description": "Annual checkup",
      "startDate": "2023-01-05T14:00:00.000Z",
      "endDate": "2023-01-05T15:00:00.000Z",
      "isAllDay": false,
      "isRecurring": false,
      "priority": "medium",
      "tags": ["health", "personal"],
      "userId": "680f925734638c115e6cac6d",
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T12:00:00.000Z"
    }
  ]
}
```

**Error Response:**
- **Code:** 500
- **Content:**
```json
{
  "success": false,
  "message": "Failed to get calendar tasks"
}
```

### Create Calendar Task

**Endpoint:** `/calendar/tasks`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "title": "Team Meeting",
  "description": "Weekly team sync meeting",
  "startDate": "2023-01-02T10:00:00.000Z",
  "endDate": "2023-01-02T11:00:00.000Z",
  "isAllDay": false,
  "isRecurring": true,
  "recurrencePattern": "weekly",
  "priority": "high",
  "tags": ["work", "meeting"]
}
```

**Success Response:**
- **Code:** 201
- **Content:**
```json
{
  "success": true,
  "data": {
    "_id": "task-1745859273543",
    "title": "Team Meeting",
    "description": "Weekly team sync meeting",
    "startDate": "2023-01-02T10:00:00.000Z",
    "endDate": "2023-01-02T11:00:00.000Z",
    "isAllDay": false,
    "isRecurring": true,
    "recurrencePattern": "weekly",
    "priority": "high",
    "tags": ["work", "meeting"],
    "userId": "680f925734638c115e6cac6d",
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

**Error Response:**
- **Code:** 400
- **Content:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Title is required", "Start date is required"]
}
```

### Get Calendar Task by ID

**Endpoint:** `/calendar/tasks/{id}`

**Method:** `GET`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "data": {
    "_id": "task-1745859273543",
    "title": "Team Meeting",
    "description": "Weekly team sync meeting",
    "startDate": "2023-01-02T10:00:00.000Z",
    "endDate": "2023-01-02T11:00:00.000Z",
    "isAllDay": false,
    "isRecurring": true,
    "recurrencePattern": "weekly",
    "priority": "high",
    "tags": ["work", "meeting"],
    "userId": "680f925734638c115e6cac6d",
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

**Error Response:**
- **Code:** 404
- **Content:**
```json
{
  "success": false,
  "message": "Task not found"
}
```

### Update Calendar Task

**Endpoint:** `/calendar/tasks/{id}`

**Method:** `PUT`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "title": "Updated Team Meeting",
  "description": "Weekly team sync meeting with new agenda",
  "priority": "medium"
}
```

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "data": {
    "_id": "task-1745859273543",
    "title": "Updated Team Meeting",
    "description": "Weekly team sync meeting with new agenda",
    "startDate": "2023-01-02T10:00:00.000Z",
    "endDate": "2023-01-02T11:00:00.000Z",
    "isAllDay": false,
    "isRecurring": true,
    "recurrencePattern": "weekly",
    "priority": "medium",
    "tags": ["work", "meeting"],
    "userId": "680f925734638c115e6cac6d",
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T13:00:00.000Z"
  }
}
```

**Error Response:**
- **Code:** 404
- **Content:**
```json
{
  "success": false,
  "message": "Task not found"
}
```

### Delete Calendar Task

**Endpoint:** `/calendar/tasks/{id}`

**Method:** `DELETE`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Response:**
- **Code:** 404
- **Content:**
```json
{
  "success": false,
  "message": "Task not found"
}
```

## Assistant API

All Assistant API endpoints require authentication via Bearer token.

### Save User Conversation

**Endpoint:** `/assistant/conversations`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "message": "Schedule a meeting with the team for tomorrow",
  "timestamp": "2023-01-01T12:00:00.000Z"
}
```

**Success Response:**
- **Code:** 201
- **Content:**
```json
{
  "success": true,
  "data": {
    "_id": "temp-id-1745859273558",
    "userId": "680f925734638c115e6cac6d",
    "message": "Schedule a meeting with the team for tomorrow",
    "timestamp": "2023-01-01T12:00:00.000Z",
    "isResponse": false,
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

**Error Response:**
- **Code:** 400
- **Content:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Message is required"]
}
```

### Save Assistant Response

**Endpoint:** `/assistant/responses`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "message": "I have scheduled a team meeting for tomorrow at 2pm",
  "timestamp": "2023-01-01T12:01:00.000Z",
  "isResponse": true
}
```

**Success Response:**
- **Code:** 201
- **Content:**
```json
{
  "success": true,
  "data": {
    "_id": "temp-resp-1745859273560",
    "userId": "680f925734638c115e6cac6d",
    "message": "I have scheduled a team meeting for tomorrow at 2pm",
    "timestamp": "2023-01-01T12:01:00.000Z",
    "isResponse": true,
    "createdAt": "2023-01-01T12:01:00.000Z",
    "updatedAt": "2023-01-01T12:01:00.000Z"
  }
}
```

**Error Response:**
- **Code:** 400
- **Content:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Message is required"]
}
```

### Get Conversation History

**Endpoint:** `/assistant/conversations/{userId}`

**Method:** `GET`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "temp-id-1745859273558",
      "userId": "680f925734638c115e6cac6d",
      "message": "Schedule a meeting with the team for tomorrow",
      "timestamp": "2023-01-01T12:00:00.000Z",
      "isResponse": false,
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T12:00:00.000Z"
    },
    {
      "_id": "temp-resp-1745859273560",
      "userId": "680f925734638c115e6cac6d",
      "message": "I have scheduled a team meeting for tomorrow at 2pm",
      "timestamp": "2023-01-01T12:01:00.000Z",
      "isResponse": true,
      "createdAt": "2023-01-01T12:01:00.000Z",
      "updatedAt": "2023-01-01T12:01:00.000Z"
    }
  ]
}
```

**Error Response:**
- **Code:** 500
- **Content:**
```json
{
  "success": false,
  "message": "Failed to retrieve conversations"
}
```

### Delete Conversation

**Endpoint:** `/assistant/conversations/{id}`

**Method:** `DELETE`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

**Error Response:**
- **Code:** 404
- **Content:**
```json
{
  "success": false,
  "message": "Conversation not found"
}
```

### Analyze Input

**Endpoint:** `/assistant/analyze`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "message": "Schedule a meeting for tomorrow at 3pm with the marketing team"
}
```

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "data": {
    "entities": {
      "dateTime": "2023-01-02T15:00:00.000Z",
      "task": "meeting",
      "people": ["marketing team"]
    },
    "intent": "schedule_meeting",
    "confidence": 0.95
  }
}
```

**Error Response:**
- **Code:** 400
- **Content:**
```json
{
  "success": false,
  "message": "Message is required for analysis"
}
``` 