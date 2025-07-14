import base64

# Load the Firebase Admin SDK file
with open("firebase-adminsdk.json", "rb") as f:
    encoded = base64.b64encode(f.read()).decode("utf-8")

# Save the base64 string to a file
with open("firebase_key_base64.txt", "w") as out:
    out.write(encoded)

print("✅ Base64 string has been saved to firebase_key_base64.txt")
