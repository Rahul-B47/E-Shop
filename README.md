# 🛒 E-Shop – Full Stack E-Commerce Web Application

> A powerful, modern, AI-enhanced online store built with React, FastAPI, Firebase, and Google Gemini.

---

## 🌐 Live Demo

- **Frontend**: [https://e-shop-frontend-h7yb.onrender.com](https://e-shop-frontend-h7yb.onrender.com)
- **Backend**: [https://e-shop-k5it.onrender.com](https://e-shop-k5it.onrender.com)

---

## 🚀 Key Features

### 🔐 Authentication & User Management
- Firebase-based email authentication
- OTP-based registration and password reset
- Password reset handled securely via Firebase Admin SDK

### 📧 Email Integration
- OTP sent via Gmail SMTP using app password
- Emails include expiration handling and resend logic

### 🧠 AI Chatbot (Google Gemini 1.5 Flash)
- Smart assistant trained with custom E-Shop knowledge base
- Text + Voice input/output
- Typing animation and voice feedback using Web Speech API

### 📦 Product Management
- Add / Edit / Delete products (admin-side)
- Image upload support
- Dynamic listing with filtering and pagination (planned)

### 🎨 Frontend (React + Tailwind)
- Responsive design (mobile/tablet/desktop)
- Animated UI elements and modals
- Light/Dark themes (planned)
- Toast notifications and form validation

### 📂 Code Structure
- Modular React components for scalability
- Centralized API management via `.env` config
- Firebase key securely injected using base64 string

---

## 🛠️ Tech Stack

| Category     | Technology                |
|--------------|---------------------------|
| **Frontend** | React.js, Tailwind CSS, React Router |
| **Backend**  | FastAPI, Pydantic, uvicorn |
| **Auth**     | Firebase Auth, Firebase Admin SDK |
| **AI Bot**   | Google Gemini 1.5 Flash API |
| **Email**    | Gmail SMTP with App Password |
| **Tools**    | dotenv, CORS, base64 key loading |

---

## 📁 Project Structure


```
ecommerce-store/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       └── main.jsx
├── backend/
│   ├── main.py
│   ├── eshop_knowledge.txt
│   └── .env
├── README.md
```

---

## 🧪 API Endpoints

| Method | Endpoint                   | Description                |
|--------|----------------------------|----------------------------|
| POST   | `/api/send-otp`            | Send OTP to user email     |
| POST   | `/api/verify-otp`          | Verify user’s OTP          |
| POST   | `/api/reset-password`      | Reset password (Firebase)  |
| POST   | `/api/send-register-otp`   | OTP for user registration  |
| POST   | `/api/verify-register-otp` | Verify signup OTP          |
| POST   | `/api/chat`                | Chatbot prompt to Gemini   |
| GET    | `/`                        | Health check               |

---

## ⚙️ Environment Variables

### 📦 Backend (`backend/.env`)

```env
GEMINI_API_KEY=your_google_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=https://e-shop-frontend-h7yb.onrender.com
FIREBASE_KEY_BASE64=base64_encoded_firebase_adminsdk_json
```

> 🔐 You can generate `FIREBASE_KEY_BASE64` like this:

```bash
base64 firebase-adminsdk.json
```

Paste the result as a **single line** into your `.env` file (no line breaks).

---

### 💻 Frontend (`frontend/.env`)

```env
REACT_APP_API_BASE_URL=https://e-shop-k5it.onrender.com
```

---

## 🧑‍💻 Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Rahul-B47/E-Shop.git
cd ecommerce-store
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
npm run dev
```

### 3. Setup Backend Environment

```bash
cd ../backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 🚀 Deployment Instructions

### 🧾 Backend (Render)

1. Go to [Render](https://render.com/)
2. Create a **new Web Service**
3. Connect your GitHub repository
4. Set:
   - **Build Command**:  
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:  
     ```bash
     uvicorn main:app --host 0.0.0.0 --port 10000
     ```
5. Add all environment variables from your `.env` file

---

### 🖼️ Frontend (Render Static Site)

1. Create a **new Static Site**
2. Set:
   - **Root Directory**: `/frontend`
   - **Build Command**:  
     ```bash
     npm run build
     ```
   - **Publish Directory**: `dist`
3. Add `static.json` in `/frontend`:

```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

4. Add `.env` variable:

```env
REACT_APP_API_BASE_URL=https://e-shop-k5it.onrender.com
```

---

## 🧪 Testing the App

- ✅ Register → OTP → Verify → Login  
- 🔐 Forgot Password → OTP → Reset  
- 🤖 Test AI Chatbot with messages like:
  - "Where’s my order?"
  - "Tell me about return policy"

---

## ✨ Screenshots (Add if needed)

Upload screenshots in `/docs/screenshots/` and embed like this:

```markdown
![Home Page](docs/screenshots/homepage.png)
```

---

## 👨‍💻 Author

Built with ❤️ by **Rahulrakesh Poojary**  
📬 Contact: [rahulrakeshpoojary0@gmail.com](mailto:rahulrakeshpoojary0@gmail.com)

---



## 🙏 Acknowledgements

- Google Gemini  
- Firebase Authentication  
- Render Hosting  
- TailwindCSS  
- FastAPI  

---

## ⭐ Support

If you like this project:

- 🌟 Star the repo  
- 🛠️ Fork it and build your own SaaS  
- 💬 Share feedback and ideas  

---

```yaml
# Let me know if you'd like to add:
# - Demo GIFs of chatbot or OTP
# - Deployment badge/shields
# - Firebase setup guide
# - Contribution guidelines (for public projects)
```

