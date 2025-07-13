from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random, smtplib, os, requests
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Firebase Admin
import firebase_admin
from firebase_admin import credentials, auth

# 🌐 Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"🔑 GEMINI_API_KEY Loaded: {bool(GEMINI_API_KEY)}")

# 🔐 Firebase Initialization
cred = credentials.Certificate("firebase-adminsdk.json")  # Keep this file safe!
firebase_admin.initialize_app(cred)

# 🚀 FastAPI App Initialization
app = FastAPI()

# 🌍 CORS Middleware - allow deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://e-shop-k5it.onrender.com"],  # Deployed React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 Pydantic Models
class OTPRequest(BaseModel):
    email: str

class OTPVerifyRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    password: str

class ChatRequest(BaseModel):
    message: str

# 🧠 In-memory OTP Store
otp_store = {}

# 📧 Email Sending Function
def send_email(to_email, subject, body):
    sender_email = "rahulrakeshpoojary0@gmail.com"
    sender_password = "fxen qljm bhac rzsb"  # Gmail App Password

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(sender_email, sender_password)
            smtp.sendmail(sender_email, to_email, msg.as_string())
        print(f"📧 Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")

# 🔁 Routes

# Send OTP for Reset
@app.post("/api/send-otp")
async def send_otp(data: OTPRequest):
    otp = str(random.randint(100000, 999999))
    otp_store[data.email] = {"otp": otp, "expires": datetime.now() + timedelta(minutes=5)}
    send_email(data.email, "🔐 OTP for Password Reset", f"Your OTP is: {otp}")
    return {"message": "✅ OTP sent to your email."}

# Verify OTP for Reset
@app.post("/api/verify-otp")
async def verify_otp(data: OTPVerifyRequest):
    record = otp_store.get(data.email)
    if not record:
        return {"success": False, "message": "❌ OTP not found."}
    if datetime.now() > record["expires"]:
        return {"success": False, "message": "❌ OTP expired."}
    if data.otp != record["otp"]:
        return {"success": False, "message": "❌ Incorrect OTP."}
    del otp_store[data.email]
    return {"success": True, "message": "✅ OTP verified."}

# Reset Password
@app.post("/api/reset-password")
async def reset_password(data: ResetPasswordRequest):
    try:
        user = auth.get_user_by_email(data.email)
        auth.update_user(user.uid, password=data.password)
        return {"success": True, "message": "✅ Password updated successfully."}
    except auth.UserNotFoundError:
        return {"success": False, "message": "❌ User not found."}
    except Exception as e:
        print("❌ Error updating password:", e)
        return {"success": False, "message": "❌ Password reset failed."}

# Send OTP for Signup
@app.post("/api/send-register-otp")
async def send_register_otp(data: OTPRequest):
    try:
        auth.get_user_by_email(data.email)
        return {"success": False, "message": "📧 Email already registered."}
    except auth.UserNotFoundError:
        otp = str(random.randint(100000, 999999))
        otp_store[data.email] = {"otp": otp, "expires": datetime.now() + timedelta(minutes=5)}
        send_email(data.email, "OTP for E-Shop Signup", f"Your OTP is: {otp}")
        return {"success": True, "message": "✅ OTP sent."}
    except Exception as e:
        print("❌ Error sending OTP:", e)
        return {"success": False, "message": "❌ Internal server error."}

# Verify OTP for Signup
@app.post("/api/verify-register-otp")
async def verify_register_otp(data: OTPVerifyRequest):
    record = otp_store.get(data.email)
    if not record:
        return {"success": False, "message": "❌ OTP not found."}
    if datetime.now() > record["expires"]:
        return {"success": False, "message": "❌ OTP expired."}
    if data.otp != record["otp"]:
        return {"success": False, "message": "❌ Incorrect OTP."}
    del otp_store[data.email]
    return {"success": True, "message": "✅ Email verified for signup."}

# Gemini Chatbot
@app.post("/api/chat")
async def chatbot(req: ChatRequest):
    user_message = req.message
    print(f"📨 Message: {user_message}")

    try:
        if not os.path.exists("eshop_knowledge.txt"):
            return {"reply": "⚠️ Setup incomplete. Knowledge file missing."}

        with open("eshop_knowledge.txt", "r", encoding="utf-8") as file:
            knowledge = file.read()

        prompt = f"""
You are a helpful AI assistant for an Indian e-commerce website called E-Shop.

Here is the latest info about E-Shop:
{knowledge}

User: {user_message}
Bot:"""

        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        headers = {"Content-Type": "application/json"}
        params = {"key": GEMINI_API_KEY}

        response = requests.post(
            url,
            headers=headers,
            params=params,
            json={"contents": [{"parts": [{"text": prompt}]}]}
        )

        data = response.json()
        print("🌐 Gemini Response:", data)

        if "candidates" not in data:
            return {"reply": "⚠️ Gemini API error."}

        reply = data["candidates"][0]["content"]["parts"][0]["text"]
        return {"reply": reply}

    except Exception as e:
        print("❌ Gemini Error:", e)
        return {"reply": "⚠️ Chatbot temporarily unavailable."}

# Test API
@app.post("/api/test")
async def test_post():
    print("✅ /api/test endpoint hit.")
    return {"message": "POST request is working!"}

# Middleware for Logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"📥 Request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"📤 Response: {response.status_code}")
    return response
