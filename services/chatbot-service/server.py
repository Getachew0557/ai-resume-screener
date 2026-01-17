from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Gemini model
model = genai.GenerativeModel('gemini-2.5-flash')

# System prompt for HR chatbot
SYSTEM_PROMPT = """You are an intelligent HR Assistant for an HR-ERP system. Your role is to help users with:

1. **Job Applications**: Guide candidates through the application process
2. **System Navigation**: Help users understand how to use the HR portal
3. **HR Policies**: Answer questions about leave, attendance, benefits, and training
4. **Interview Process**: Explain the recruitment and interview workflow
5. **General HR Questions**: Provide helpful information about HR processes

Key Information:
- The system has an AI-powered resume screening feature
- Candidates with scores >70% automatically get interview invitations
- The portal has different roles: Admin, HR, Manager, and Employee
- Services include: Recruitment, Attendance, Leave Management, Training, Benefits
- Login credentials for demo: admin@hrms.com / Admin@123

Be helpful, professional, and concise. If you don't know something, be honest about it.
Provide actionable guidance and next steps when possible.
"""

# Conversation history storage (in production, use Redis or database)
conversations = {}

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "Chatbot Service is running", "model": "gemini-2.5-flash"}), 200

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "")
        session_id = data.get("session_id", "default")
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        # Get or create conversation history
        if session_id not in conversations:
            conversations[session_id] = []
        
        # Add user message to history
        conversations[session_id].append({
            "role": "user",
            "parts": [user_message]
        })
        
        # Create chat with history
        chat = model.start_chat(history=conversations[session_id][:-1])
        
        # Get response from Gemini
        response = chat.send_message(
            f"{SYSTEM_PROMPT}\n\nUser: {user_message}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.95,
                top_k=40,
                max_output_tokens=500,
            )
        )
        
        bot_response = response.text
        
        # Add bot response to history
        conversations[session_id].append({
            "role": "model",
            "parts": [bot_response]
        })
        
        # Keep only last 10 messages to avoid token limits
        if len(conversations[session_id]) > 20:
            conversations[session_id] = conversations[session_id][-20:]
        
        return jsonify({
            "response": bot_response,
            "session_id": session_id,
            "status": "success"
        }), 200
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({
            "error": str(e),
            "response": "I apologize, but I'm having trouble processing your request. Please try again."
        }), 500

@app.route("/reset", methods=["POST"])
def reset_conversation():
    """Reset conversation history for a session"""
    try:
        data = request.json
        session_id = data.get("session_id", "default")
        
        if session_id in conversations:
            del conversations[session_id]
        
        return jsonify({
            "status": "success",
            "message": "Conversation reset"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY not found in environment variables!")
    app.run(host='0.0.0.0', debug=True, port=5006)
