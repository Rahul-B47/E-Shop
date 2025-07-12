from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random, smtplib, os, requests
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Firebase Admin
import firebase_admin
from firebase_admin import credentials, auth

# 🌐 Load ENV
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"🔑 GEMINI_API_KEY: {GEMINI_API_KEY}")  # DEBUG

# 🔐 Firebase Init
cred = credentials.Certificate("firebase-adminsdk.json")
firebase_admin.initialize_app(cred)

app = FastAPI()

# 🌍 Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 Models
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

# 🧠 In-memory store
otp_store = {}

# 📧 EMAIL Function
def send_email(to_email, subject, body):
    sender_email = "rahulrakeshpoojary0@gmail.com"
    sender_password = "fxen qljm bhac rzsb"  # App password

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
        print(f"❌ Email send error: {e}")

# 🔁 OTP Routes
@app.post("/api/send-otp")
async def send_otp(data: OTPRequest):
    otp = str(random.randint(100000, 999999))
    otp_store[data.email] = {"otp": otp, "expires": datetime.now() + timedelta(minutes=5)}
    send_email(data.email, "🔐 Your OTP for Password Reset", f"Your OTP is: {otp}")
    return {"message": "✅ OTP sent to your email."}

@app.post("/api/verify-otp")
async def verify_otp(data: OTPVerifyRequest):
    record = otp_store.get(data.email)
    if not record:
        return {"success": False, "message": "OTP not found."}
    if datetime.now() > record["expires"]:
        return {"success": False, "message": "OTP expired."}
    if data.otp != record["otp"]:
        return {"success": False, "message": "Incorrect OTP."}
    del otp_store[data.email]
    return {"success": True, "message": "✅ OTP verified"}

@app.post("/api/reset-password")
async def reset_password(data: ResetPasswordRequest):
    try:
        user = auth.get_user_by_email(data.email)
        auth.update_user(user.uid, password=data.password)
        return {"success": True, "message": "✅ Password updated"}
    except auth.UserNotFoundError:
        return {"success": False, "message": "❌ User not found."}
    except Exception as e:
        print("❌ Error updating password:", e)
        return {"success": False, "message": "❌ Reset failed."}

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
        print("❌ Error:", e)
        return {"success": False, "message": "❌ Server error."}

@app.post("/api/verify-register-otp")
async def verify_register_otp(data: OTPVerifyRequest):
    record = otp_store.get(data.email)
    if not record:
        return {"success": False, "message": "OTP not found."}
    if datetime.now() > record["expires"]:
        return {"success": False, "message": "OTP expired."}
    if data.otp != record["otp"]:
        return {"success": False, "message": "Incorrect OTP."}
    del otp_store[data.email]
    return {"success": True, "message": "✅ Email verified for signup"}

# ✅ Test Route to Check POST
@app.post("/api/test")
async def test_post():
    print("✅ /api/test hit successfully!")
    return {"message": "POST request is working!"}

# 🤖 Gemini Chatbot Route with full debug
@app.post("/api/chat")
async def chatbot(req: ChatRequest):
    user_message = req.message
    print(f"📨 Received chat message: {user_message}")

    try:
        if not os.path.exists("eshop_knowledge.txt"):
            print("❌ eshop_knowledge.txt not found!")
            return {"reply": "⚠️ Setup incomplete. Knowledge file missing."}

        with open("eshop_knowledge.txt", "r", encoding="utf-8") as f:
            knowledge = f.read()
        print("📘 Knowledge file loaded.")

        prompt = f"""
You are a helpful AI assistant for an Indian e-commerce website called E-Shop.

Here is the latest info about E-Shop:
{knowledge}

User: {user_message}
Bot:"""

        print("🔗 Sending request to Gemini API...")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            params={"key": GEMINI_API_KEY},
            json={"contents": [{"parts": [{"text": prompt}]}]}
        )

        print("🌐 Raw Gemini response:", response.text)

        data = response.json()

        if "candidates" not in data:
            print("❌ Invalid Gemini response format:", data)
            return {"reply": "⚠️ Gemini did not respond properly."}

        reply = data["candidates"][0]["content"]["parts"][0]["text"]
        print("🤖 Bot reply:", reply)

        return {"reply": reply}

    except Exception as e:
        print("❌ Gemini Error:", e)
        return {"reply": "⚠️ Sorry, the bot is currently unavailable."}

# 🔍 Middleware Logger
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"📥 Incoming Request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"📤 Response Status: {response.status_code}")
    return response
