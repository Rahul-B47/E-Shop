from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from dotenv import load_dotenv
import random, smtplib, os, requests, traceback, json, base64

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, auth

# Load .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
FIREBASE_KEY_BASE64 = os.getenv("FIREBASE_KEY_BASE64")

print(f"🔑 GEMINI_API_KEY Loaded: {bool(GEMINI_API_KEY)}")
print(f"🌐 FRONTEND_URL Allowed: {FRONTEND_URL}")
print(f"🛡️ Firebase key loaded from base64: {bool(FIREBASE_KEY_BASE64)}")

# Firebase Init from base64 string
try:
    if not FIREBASE_KEY_BASE64:
        raise Exception("FIREBASE_KEY_BASE64 is missing!")

    decoded_bytes = base64.b64decode(FIREBASE_KEY_BASE64)
    cred_data = json.loads(decoded_bytes.decode("utf-8"))
    cred = credentials.Certificate(cred_data)
    firebase_admin.initialize_app(cred)
    print("✅ Firebase Admin Initialized via base64")
except Exception as e:
    print(f"❌ Firebase Init Error: {e}")

# FastAPI App
app = FastAPI()

# CORS Setup
allowed_origins = [FRONTEND_URL, "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CORS + Request Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    origin = request.headers.get("origin")
    print(f"\n📥 {request.method} {request.url}")
    print(f"📦 Origin Header: {origin}")
    if origin in allowed_origins:
        print("✅ Origin allowed by CORS")
    else:
        print("❌ Origin NOT allowed by CORS")

    response = await call_next(request)
    print(f"📤 Status Code: {response.status_code}\n")
    return response

# Models
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

# OTP Store
otp_store = {}

# Email Sender
def send_email(to_email, subject, body):
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")
    print(f"📨 Sending Email to {to_email}")

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(sender_email, sender_password)
            smtp.sendmail(sender_email, to_email, msg.as_string())
        print("📧 Email sent successfully")
    except Exception as e:
        print(f"❌ Email sending failed: {e}")

# Routes
@app.get("/")
async def root():
    print("✅ Root Endpoint Hit")
    return {"message": "✅ FastAPI backend is live!"}

@app.post("/api/send-otp")
async def send_otp(data: OTPRequest):
    print(f"📨 OTP requested for {data.email}")
    try:
        otp = str(random.randint(100000, 999999))
        otp_store[data.email] = {"otp": otp, "expires": datetime.now() + timedelta(minutes=5)}
        send_email(data.email, "OTP for Password Reset", f"Your OTP is: {otp}")
        return {"message": "✅ OTP sent"}
    except Exception as e:
        print(f"❌ /send-otp error: {e}")
        return {"message": "❌ Failed to send OTP"}

@app.post("/api/verify-otp")
async def verify_otp(data: OTPVerifyRequest):
    print(f"🔍 Verifying OTP for {data.email}")
    record = otp_store.get(data.email)
    if not record:
        print("❌ No OTP found")
        return {"success": False, "message": "❌ OTP not found"}
    if datetime.now() > record["expires"]:
        print("❌ OTP expired")
        return {"success": False, "message": "❌ OTP expired"}
    if data.otp != record["otp"]:
        print("❌ Incorrect OTP")
        return {"success": False, "message": "❌ Incorrect OTP"}
    del otp_store[data.email]
    print("✅ OTP Verified")
    return {"success": True, "message": "✅ OTP verified"}

@app.post("/api/reset-password")
async def reset_password(data: ResetPasswordRequest):
    print(f"🔒 Password reset requested for {data.email}")
    try:
        user = auth.get_user_by_email(data.email)
        print(f"👤 Found user: UID = {user.uid}")
        auth.update_user(user.uid, password=data.password)
        print("✅ Password updated successfully")
        return {"success": True, "message": "✅ Password updated"}
    except auth.UserNotFoundError:
        print("❌ User not found in Firebase")
        return {"success": False, "message": "❌ User not found"}
    except Exception as e:
        print("❌ Exception occurred during password reset:")
        traceback.print_exc()
        return {"success": False, "message": f"❌ Failed to reset password: {str(e)}"}

@app.post("/api/send-register-otp")
async def send_register_otp(data: OTPRequest):
    print(f"📨 Register OTP for {data.email}")
    try:
        auth.get_user_by_email(data.email)
        print("❌ Email already exists")
        return {"success": False, "message": "📧 Already registered"}
    except auth.UserNotFoundError:
        otp = str(random.randint(100000, 999999))
        otp_store[data.email] = {"otp": otp, "expires": datetime.now() + timedelta(minutes=5)}
        send_email(data.email, "OTP for Signup", f"Your OTP is: {otp}")
        print("✅ OTP sent for registration")
        return {"success": True, "message": "✅ OTP sent"}
    except Exception as e:
        print(f"❌ Register OTP error: {e}")
        return {"success": False, "message": "❌ Internal error"}

@app.post("/api/verify-register-otp")
async def verify_register_otp(data: OTPVerifyRequest):
    print(f"🔍 Verifying registration OTP for {data.email}")
    record = otp_store.get(data.email)
    if not record:
        print("❌ No OTP found")
        return {"success": False, "message": "❌ OTP not found"}
    if datetime.now() > record["expires"]:
        print("❌ OTP expired")
        return {"success": False, "message": "❌ OTP expired"}
    if data.otp != record["otp"]:
        print("❌ OTP incorrect")
        return {"success": False, "message": "❌ Incorrect OTP"}
    del otp_store[data.email]
    print("✅ Registration OTP verified")
    return {"success": True, "message": "✅ Verified"}

@app.post("/api/chat")
async def chatbot(req: ChatRequest):
    print(f"💬 Chat received: {req.message}")
    try:
        if not os.path.exists("eshop_knowledge.txt"):
            print("❌ File eshop_knowledge.txt missing")
            return {"reply": "⚠️ Setup incomplete"}

        with open("eshop_knowledge.txt", "r", encoding="utf-8") as file:
            knowledge = file.read()

        prompt = f"""You are a helpful AI assistant for E-Shop.
Knowledge base:
{knowledge}
User: {req.message}
Bot:"""

        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        headers = {"Content-Type": "application/json"}
        params = {"key": GEMINI_API_KEY}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        response = requests.post(url, headers=headers, params=params, json=payload)
        result = response.json()
        print("🌐 Gemini API Response:", result)

        if "candidates" not in result:
            return {"reply": "⚠️ Gemini API Error"}
        reply = result["candidates"][0]["content"]["parts"][0]["text"]
        print(f"🤖 Bot Reply: {reply}")
        return {"reply": reply}
    except Exception as e:
        print(f"❌ Chatbot error: {e}")
        return {"reply": "⚠️ Chatbot down"}

@app.post("/api/test")
async def test():
    print("🧪 Test endpoint hit")
    return {"message": "✅ POST test successful"}
