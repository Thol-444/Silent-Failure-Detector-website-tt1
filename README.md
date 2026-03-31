# Silent-Failure-Detector-website-tt1
## 🚀 Silent Failure Detector + Learning Management System (LMS)

A full-stack web application that monitors student activity, detects inactivity (silent failure), and provides alerts, analytics, and communication tools for instructors and admins.

---

## 📌 Features

### 🔐 Authentication
- User Registration (Name, Email, Password, Phone, Role)
- Login with JWT Authentication
- Role-based access (Admin / Instructor / Student)

---

### 👨‍🎓 Student Features
- View available courses
- Enroll in courses
- Submit assignments
- View submission history
- 📊 Monthly activity analytics (streak system like LeetCode/Udemy)

---

### 👨‍🏫 Instructor Features
- Create / Update / Delete courses
- Add assignments
- Monitor student activity
- Identify inactive students

---

### 🧑‍💼 Admin Features
- View all users
- Delete users
- Monitor system usage

---

### 🚨 Silent Failure Detection
- Detect inactive students
- Flag students who:
  - Don’t complete courses
  - Don’t submit assignments
- Trigger alerts for instructors/admins

---

### 🔔 Notification System
- Real-time notifications
- Notification bell UI
- Alerts for inactivity & updates

---

### 📩 Alert System
- Send alerts to:
  - 📧 Email
  - 📱 SMS
- Notify inactive students

---

### 🤖 AI Chatbot (Planned)
- Help students & instructors with queries
- Provide guidance and system help

---

## 🛠️ Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security (JWT)
- Hibernate / JPA
- PostgreSQL

### Frontend
- React.js
- Tailwind CSS
- Axios

---

## ⚙️ API Endpoints

### 🔐 Auth
- `POST /auth/register`
- `POST /auth/login`

---

### 👨‍🎓 Student
- `GET /student/courses`
- `POST /student/enroll`
- `POST /student/submit`
- `GET /student/submissions/{userId}`

---

### 👨‍🏫 Instructor
- `POST /instructor/course`
- `PUT /instructor/course/{id}`
- `DELETE /instructor/course/{id}`
- `POST /instructor/assignment`

---

### 🧑‍💼 Admin
- `GET /admin/users`
- `DELETE /admin/user/{id}`

---

## 🔑 Authentication

- JWT Token-based authentication
- Pass token in headers:

```http
Authorization: Bearer <your_token>
