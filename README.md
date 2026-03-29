# AI-Tutored-Coding-Platform 🚀

![Project Banner](docs/banner.png)

A professional-grade backend for a competitive programming platform, similar to LeetCode, built with **Node.js**, **Express**, and **MongoDB**. This project features a sophisticated AI-powered hint system, enterprise-level rate limiting, and a robust architecture designed for scalability.

---

## 🌟 Key Features

### 🤖 4-Level AI Hint System
Bridging the gap between static content and interactive learning. Our system uses **Google Gemini AI** to provide progressive hints:
1.  **Conceptual Hint**: High-level approach without exposing logic.
2.  **Logic Hint**: Deeper breakdown of the algorithm.
3.  **Code Snippet**: Partial implementation to guide the user.
4.  **Full Logic/Solution**: Complete explanation for deep understanding.

### 🛡️ Performance & Security
- **Redis Rate Limiting**: Protection against brute-force attacks and API abuse using distributed caching.
- **JWT Authentication**: Secure user sessions with JSON Web Tokens.
- **Input Validation**: Comprehensive data sanitization using `validator.js`.

### 📊 Problem & Submission Management
- **CRUD Operations**: Full control over coding problems and metadata.
- **Test Case Validation**: Robust submission workflow with real-time feedback.
- **History Tracking**: Complete log of user attempts and performance.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Cache & Security**: Redis
- **AI Integration**: Google Generative AI (Gemini)
- **Utilities**: JWT, Bcrypt, Validator, Nodemon

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or Local MongoDB
- [Redis](https://redis.io/)
- [Gemini AI API Key](https://aistudio.google.com/app/apikey)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/laksh0507/AI-Tutored-Coding-Platform.git
   cd AI-Tutored-Coding-Platform
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   REDIS_URL=your_redis_url
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
src/
├── config/          # Configuration files (DB, AI, Redis)
├── controllers/     # Business logic for all modules
├── middleware/      # Auth & Rate Limiting middlewares
├── models/          # Mongoose schemas & data models
├── routes/          # API endpoints definition
├── utils/           # Helper functions & validation
└── index.js         # Application entry point
```

---

## 📝 Roadmap
- [ ] Dockerization for easy deployment
- [ ] Integration with a multi-language execution engine
- [ ] Leaderboard and competitive scoring system
- [ ] Dark mode UI/UX for the frontend

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
**Developed with ❤️ by [LAKSHMISHA R A](https://github.com/laksh0507)**
