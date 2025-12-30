# 🛍️ SaveKaro - Fashion Deal Aggregator

<div align="center">

![SaveKaro Logo](https://img.shields.io/badge/SaveKaro-Fashion%20Deals-DC2626?style=for-the-badge&logo=shopping-bag&logoColor=white)

**Pakistan's #1 Fashion Deal Aggregation Platform**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=flat-square)](https://your-netlify-url.netlify.app)
[![API Status](https://img.shields.io/badge/API-Online-success?style=flat-square)](https://your-render-url.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📖 About

**SaveKaro** is a comprehensive fashion deal aggregation platform designed to help Pakistani consumers discover the best fashion deals across multiple e-commerce websites. The platform aggregates products from various sources, presents them in an intuitive interface, and provides users with personalized features like favorites management, email verification, and secure authentication.

### 🎯 Why SaveKaro?

- **Save Time**: Browse deals from multiple stores in one place
- **Save Money**: Find the best discounts and compare prices instantly
- **Stay Updated**: Get access to the latest fashion deals from top Pakistani brands
- **Personalized Experience**: Save favorites and manage your preferences

---

## ✨ Features

### 🔐 User Authentication & Security
- Secure JWT-based authentication
- bcrypt password hashing
- Email verification system
- Password reset functionality
- Protected routes and API endpoints

### 🛍️ Product Management
- Real-time product aggregation from multiple sources
- Advanced search and filtering (category, brand, price, gender)
- Product detail pages with related products
- Responsive product cards with discount badges

### ❤️ Favorites System
- Save favorite products
- Modern carousel display
- Persistent state across sessions
- Easy add/remove functionality

### 📧 Email Services
- Automated email verification
- Password reset emails
- Professional HTML email templates
- SMTP integration with Gmail

### 🎨 Modern UI/UX
- Fully responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Skeleton loading screens
- Pop-up effects and modern styling
- Intuitive navigation

### 🚀 Performance
- Fast API responses with FastAPI
- Async database operations
- Optimized frontend with React 18
- CDN delivery via Netlify

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat-square&logo=react&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-6.0-CA4245?style=flat-square&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.6-5A29E4?style=flat-square&logo=axios&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Custom-1572B6?style=flat-square&logo=css3&logoColor=white)

- **React.js 18** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **CSS3** - Custom styling with modern animations

### Backend
![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688?style=flat-square&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=flat-square&logo=mongodb&logoColor=white)

- **Python 3.10** - Backend language
- **FastAPI** - Modern web framework
- **Motor** - Async MongoDB driver
- **PyJWT** - JWT authentication
- **bcrypt** - Password hashing
- **aiosmtplib** - Async email service

### Database
- **MongoDB Atlas** - Cloud database
- Collections: `users`, `products`
- Indexing for optimal performance

### Deployment
![Netlify](https://img.shields.io/badge/Netlify-Frontend-00C7B7?style=flat-square&logo=netlify&logoColor=white)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=flat-square&logo=render&logoColor=white)

- **Netlify** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Database hosting
- **GitHub** - Version control & CI/CD

---

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- Python 3.10+
- MongoDB (Atlas account or local installation)
- Git

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ArsalAjmal/SaveKaro.git
cd SaveKaro
```

### 2️⃣ Backend Setup

```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Create .env file in root directory
touch .env
```

**Configure `.env` file:**
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/savekaro

# JWT
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Email (Gmail SMTP)
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Start backend server:**
```bash
cd backend
python main.py
```
Backend will run on `http://localhost:8000`

### 3️⃣ Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create .env file
touch .env
```

**Configure `frontend/.env` file:**
```env
REACT_APP_API_URL=http://localhost:8000
```

**Start frontend server:**
```bash
npm start
```
Frontend will run on `http://localhost:3000`

### 4️⃣ Access the Application

Open your browser and visit: **http://localhost:3000**

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:8000
Production: https://your-backend.onrender.com
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: { "access_token": "jwt-token", "token_type": "bearer" }
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "new_password": "newsecurepassword"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?category=shoes&brand=Nike&min_price=1000&max_price=5000
```

#### Get Product by ID
```http
GET /api/products/{product_id}
```

#### Search Products
```http
GET /api/products/search?q=sneakers
```

### Favorites Endpoints (Authenticated)

#### Add to Favorites
```http
POST /api/auth/favorites/add/{product_id}
Authorization: Bearer {jwt-token}
```

#### Remove from Favorites
```http
DELETE /api/auth/favorites/remove/{product_id}
Authorization: Bearer {jwt-token}
```

#### Get Favorites
```http
GET /api/auth/favorites
Authorization: Bearer {jwt-token}
```

---

## 🚀 Deployment

### Frontend Deployment (Netlify)

1. **Connect GitHub Repository**
   - Sign in to Netlify
   - Click "New site from Git"
   - Select your repository

2. **Configure Build Settings**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/build
   ```

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will auto-deploy on every push to main

### Backend Deployment (Render)

1. **Create Web Service**
   - Sign in to Render
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: savekaro-backend
   Environment: Python 3
   Build Command: pip install -r backend/requirements.txt
   Start Command: python backend/main.py
   ```

3. **Environment Variables**
   - Add all variables from `.env` file
   - Update `FRONTEND_URL` to your Netlify URL

4. **Deploy**
   - Click "Create Web Service"
   - Render will auto-deploy on every push to main

### Database (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Set up database user and password
4. Whitelist IP addresses (or allow all: 0.0.0.0/0)
5. Get connection string and add to environment variables

---

## 📁 Project Structure

```
SaveKaro/
├── backend/
│   ├── routes/
│   │   ├── auth.py          # Authentication routes
│   │   └── products.py      # Product routes
│   ├── models/
│   │   └── models.py        # Pydantic models
│   ├── config.py            # Configuration settings
│   ├── database.py          # MongoDB connection
│   ├── email_utils.py       # Email service
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── public/
│   │   ├── _redirects       # Netlify routing
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React Context (Auth)
│   │   ├── styles/          # CSS files
│   │   ├── lib/             # Utility functions
│   │   ├── App.js           # Main App component
│   │   └── index.js         # Entry point
│   ├── package.json         # npm dependencies
│   └── .env                 # Environment variables
│
├── .env                     # Backend environment variables
├── .gitignore
├── Procfile                 # Render deployment
├── runtime.txt              # Python version
└── README.md                # This file
```

---

## 🔒 Security

- **Password Hashing**: bcrypt with automatic salt generation
- **JWT Tokens**: Secure token-based authentication with expiration
- **Email Verification**: Mandatory email verification for new accounts
- **CORS Protection**: Configured Cross-Origin Resource Sharing
- **Environment Variables**: Sensitive data not committed to repository
- **Input Validation**: Pydantic models for request validation
- **HTTPS**: Encrypted communication via Netlify and Render SSL

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add some AmazingFeature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation if needed

---

## 🐛 Known Issues

- None currently reported

### Reporting Bugs
If you find a bug, please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Arsal Ajmal**

- GitHub: [@ArsalAjmal](https://github.com/ArsalAjmal)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/arsal-ajmal)
- Email: arsal@example.com

---

## 🙏 Acknowledgments

- **React Team** - For the amazing React library
- **FastAPI** - For the modern Python web framework
- **MongoDB** - For the flexible NoSQL database
- **Netlify & Render** - For reliable hosting services
- **All Contributors** - Thank you for your contributions!

---

## 📊 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/ArsalAjmal/SaveKaro?style=social)
![GitHub Forks](https://img.shields.io/github/forks/ArsalAjmal/SaveKaro?style=social)
![GitHub Issues](https://img.shields.io/github/issues/ArsalAjmal/SaveKaro)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/ArsalAjmal/SaveKaro)

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ in Pakistan**

[⬆ Back to Top](#️-savekaro---fashion-deal-aggregator)

</div>
